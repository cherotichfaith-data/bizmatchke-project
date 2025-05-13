"use server"

import { executeQuery } from "@/lib/db"
import { getCurrentUser } from "./auth"
import { revalidatePath } from "next/cache"
import { generateAIBusinessIdeas } from "./ai-idea-generator"

// Update the BusinessIdea interface with more specific types
export interface BusinessIdea {
  id: number
  title: string
  description: string
  budget_range: string
  location: string
  created_at: Date
  created_by: number
  is_generated: boolean
  skills: string[]
  interests: string[]
  potential_challenges?: string[]
  success_factors?: string[]
  target_market?: string
  // New fields
  market_trends?: string[]
  success_rate_estimate?: string
  estimated_roi?: string
  economic_data?: {
    growth_potential: string
    market_saturation: string
    competition_level: string
  }
  // Financial projection reference
  has_financial_projection?: boolean
}

// Define error types for better error handling
type BusinessError = {
  code: string
  message: string
  details?: any
}

// Helper function to safely parse JSON
function safeJsonParse(jsonString: any, defaultValue: any = []): any {
  // If the value is null or undefined, return the default value
  if (jsonString === null || jsonString === undefined) {
    return defaultValue
  }

  // If it's already an object or array (not a string), return it as is
  if (typeof jsonString === "object") {
    return jsonString
  }

  // Make sure we're working with a string
  const stringValue = String(jsonString)

  try {
    // Check if the string is in JSON format
    if (stringValue.trim().startsWith("[") || stringValue.trim().startsWith("{")) {
      return JSON.parse(stringValue)
    }

    // If it's a non-empty string that's not in JSON format, return it as an array with one item
    if (stringValue.trim() !== "") {
      return [stringValue]
    }

    // Empty string case
    return defaultValue
  } catch (error) {
    console.error(`Error parsing JSON: ${error instanceof Error ? error.message : "Unknown error"}`)
    console.error(`Problematic JSON string: ${stringValue.substring(0, 100)}...`)
    return defaultValue
  }
}

// Generate business ideas
export async function generateBusinessIdeas(formData: FormData) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return { success: false, message: "User not authenticated", code: "AUTH_ERROR" }
    }

    const skills = formData.getAll("skills") as string[]
    const interests = formData.getAll("interests") as string[]
    const budget = formData.get("budget") as string
    const location = formData.get("location") as string

    if (!budget) {
      return { success: false, message: "Budget is required", code: "VALIDATION_ERROR" }
    }

    if (!location) {
      return { success: false, message: "Location is required", code: "VALIDATION_ERROR" }
    }

    if (skills.length === 0) {
      return { success: false, message: "At least one skill is required", code: "VALIDATION_ERROR" }
    }

    if (interests.length === 0) {
      return { success: false, message: "At least one interest is required", code: "VALIDATION_ERROR" }
    }

    // Start a transaction for related operations
    await executeQuery("BEGIN")

    try {
      // Log user activity
      await executeQuery("INSERT INTO user_activity (user_id, activity_type, description) VALUES ($1, $2, $3)", [
        user.id,
        "GENERATE_IDEAS",
        `Generated ideas with ${skills.length} skills and ${interests.length} interests`,
      ])

      // Generate ideas using AI
      const generatedIdeas = await generateAIBusinessIdeas(skills, interests, budget, location)

      const ideas: BusinessIdea[] = []

      // Store each generated idea in the database
      for (const idea of generatedIdeas) {
        // Update the generateBusinessIdeas function to store the additional metadata
        // Inside the for loop where ideas are stored, update the SQL query:
        const result = await executeQuery<any[]>(
          `INSERT INTO business_ideas 
           (title, description, budget_range, location, created_by, is_generated,
            potential_challenges, success_factors, market_trends, 
            success_rate_estimate, estimated_roi, economic_data) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
           RETURNING id, title, description, budget_range, location, created_at, created_by, is_generated`,
          [
            idea.title,
            idea.description,
            idea.startup_costs,
            location,
            user.id,
            true,
            JSON.stringify(idea.potential_challenges || []),
            JSON.stringify(idea.success_factors || []),
            JSON.stringify(idea.market_trends || []),
            idea.success_rate_estimate || null,
            idea.estimated_roi || null,
            idea.economic_data ? JSON.stringify(idea.economic_data) : null,
          ],
        )

        const businessIdea = result[0]

        // Add skills to the idea
        const allSkills = [...new Set([...skills, ...idea.skills_required])]
        for (const skill of allSkills) {
          // Get or create the skill
          const skillResult = await executeQuery<any[]>(
            "INSERT INTO skills (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = $1 RETURNING id",
            [skill],
          )

          const skillId = skillResult[0].id

          // Associate skill with the idea
          await executeQuery(
            "INSERT INTO business_idea_skills (business_idea_id, skill_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
            [businessIdea.id, skillId],
          )
        }

        // Add interests to the idea
        for (const interest of interests) {
          // Get or create the interest
          const interestResult = await executeQuery<any[]>(
            "INSERT INTO interests (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = $1 RETURNING id",
            [interest],
          )

          const interestId = interestResult[0].id

          // Associate interest with the idea
          await executeQuery(
            "INSERT INTO business_idea_interests (business_idea_id, interest_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
            [businessIdea.id, interestId],
          )
        }

        // Update the ideas.push to include the new fields
        ideas.push({
          ...businessIdea,
          skills: allSkills,
          interests: interests,
          potential_challenges: idea.potential_challenges,
          success_factors: idea.success_factors,
          target_market: idea.target_market,
          // New fields
          market_trends: idea.market_trends,
          success_rate_estimate: idea.success_rate_estimate,
          estimated_roi: idea.estimated_roi,
          economic_data: idea.economic_data,
          has_financial_projection: false,
        })
      }

      // Commit the transaction
      await executeQuery("COMMIT")

      return { success: true, ideas }
    } catch (error) {
      // Rollback the transaction on error
      await executeQuery("ROLLBACK")
      throw error
    }
  } catch (error) {
    console.error("Generate ideas error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
    const errorCode = error instanceof Error && (error as any).code ? (error as any).code : "UNKNOWN_ERROR"

    return {
      success: false,
      message: `Failed to generate ideas: ${errorMessage}`,
      code: errorCode,
    }
  }
}

// Save a business idea
export async function saveBusinessIdea(ideaId: number, notes?: string) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return { success: false, message: "User not authenticated", code: "AUTH_ERROR" }
    }

    // Start a transaction
    await executeQuery("BEGIN")

    try {
      // Check if the idea exists
      const ideaResult = await executeQuery<any[]>("SELECT id FROM business_ideas WHERE id = $1", [ideaId])

      if (ideaResult.length === 0) {
        await executeQuery("ROLLBACK")
        return { success: false, message: "Business idea not found", code: "NOT_FOUND" }
      }

      // Save the idea
      await executeQuery(
        "INSERT INTO saved_ideas (user_id, business_idea_id, notes) VALUES ($1, $2, $3) ON CONFLICT (user_id, business_idea_id) DO UPDATE SET notes = $3",
        [user.id, ideaId, notes || null],
      )

      // Log user activity
      await executeQuery(
        "INSERT INTO user_activity (user_id, activity_type, description, related_id) VALUES ($1, $2, $3, $4)",
        [user.id, "SAVE_IDEA", "Saved a business idea", ideaId],
      )

      // Commit the transaction
      await executeQuery("COMMIT")

      revalidatePath("/dashboard/saved-ideas")

      return { success: true }
    } catch (error) {
      // Rollback the transaction on error
      await executeQuery("ROLLBACK")
      throw error
    }
  } catch (error) {
    console.error("Save idea error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
    const errorCode = error instanceof Error && (error as any).code ? (error as any).code : "UNKNOWN_ERROR"

    return {
      success: false,
      message: `Failed to save idea: ${errorMessage}`,
      code: errorCode,
    }
  }
}

// Get saved ideas for a user
export async function getSavedIdeas() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return { success: false, message: "User not authenticated", code: "AUTH_ERROR" }
    }

    // First check if the financial_projections table exists
    const tableExists = await checkIfTableExists("financial_projections")

    // Construct the query based on whether the financial_projections table exists
    let query = `
      SELECT 
        si.id, si.notes, si.saved_at,
        bi.id as business_idea_id, bi.title, bi.description, bi.budget_range, bi.location, bi.created_at,
        bi.potential_challenges, bi.success_factors, bi.market_trends, 
        bi.success_rate_estimate, bi.estimated_roi, bi.economic_data
    `

    // Only add the financial projections check if the table exists
    if (tableExists) {
      query += `, (SELECT COUNT(*) > 0 FROM financial_projections fp WHERE fp.business_idea_id = bi.id) as has_financial_projection`
    } else {
      query += `, false as has_financial_projection`
    }

    query += `
       FROM 
        saved_ideas si
       JOIN 
        business_ideas bi ON si.business_idea_id = bi.id
       WHERE 
        si.user_id = $1
       ORDER BY 
        si.saved_at DESC
    `

    const savedIdeasResult = await executeQuery<any[]>(query, [user.id])

    // Get skills and interests for each idea
    const savedIdeas = await Promise.all(
      savedIdeasResult.map(async (idea) => {
        // Get skills
        const skillsResult = await executeQuery<any[]>(
          `SELECT s.name
         FROM business_idea_skills bis
         JOIN skills s ON bis.skill_id = s.id
         WHERE bis.business_idea_id = $1`,
          [idea.business_idea_id],
        )

        // Get interests
        const interestsResult = await executeQuery<any[]>(
          `SELECT i.name
         FROM business_idea_interests bii
         JOIN interests i ON bii.interest_id = i.id
         WHERE bii.business_idea_id = $1`,
          [idea.business_idea_id],
        )

        // Debug log to see what's coming from the database
        console.log("Raw data from database:", {
          potential_challenges: typeof idea.potential_challenges,
          success_factors: typeof idea.success_factors,
          market_trends: typeof idea.market_trends,
          economic_data: typeof idea.economic_data,
        })

        // Update the return object in the savedIdeas map function with safe JSON parsing:
        return {
          id: idea.id,
          business_idea_id: idea.business_idea_id,
          title: idea.title,
          description: idea.description,
          budget_range: idea.budget_range,
          location: idea.location,
          created_at: idea.created_at,
          saved_at: idea.saved_at,
          notes: idea.notes,
          skills: skillsResult.map((s) => s.name),
          interests: interestsResult.map((i) => i.name),
          // Use safe JSON parsing for all JSON fields
          potential_challenges: safeJsonParse(idea.potential_challenges, []),
          success_factors: safeJsonParse(idea.success_factors, []),
          market_trends: safeJsonParse(idea.market_trends, []),
          success_rate_estimate: idea.success_rate_estimate,
          estimated_roi: idea.estimated_roi,
          economic_data: safeJsonParse(idea.economic_data, null),
          has_financial_projection: idea.has_financial_projection,
        }
      }),
    )

    return { success: true, savedIdeas }
  } catch (error) {
    console.error("Get saved ideas error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
    const errorCode = error instanceof Error && (error as any).code ? (error as any).code : "UNKNOWN_ERROR"

    return {
      success: false,
      message: `Failed to get saved ideas: ${errorMessage}`,
      code: errorCode,
    }
  }
}

// Helper function to check if a table exists in the database
async function checkIfTableExists(tableName: string): Promise<boolean> {
  try {
    const result = await executeQuery<any[]>(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = $1
      )`,
      [tableName],
    )
    return result[0].exists
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error)
    return false
  }
}

// Remove a saved idea
export async function removeSavedIdea(savedIdeaId: number) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return { success: false, message: "User not authenticated", code: "AUTH_ERROR" }
    }

    // Start a transaction
    await executeQuery("BEGIN")

    try {
      // Get the business idea ID for activity log
      const savedIdeaResult = await executeQuery<any[]>(
        "SELECT business_idea_id FROM saved_ideas WHERE id = $1 AND user_id = $2",
        [savedIdeaId, user.id],
      )

      if (savedIdeaResult.length === 0) {
        await executeQuery("ROLLBACK")
        return { success: false, message: "Saved idea not found", code: "NOT_FOUND" }
      }

      const businessIdeaId = savedIdeaResult[0].business_idea_id

      // Remove the saved idea
      await executeQuery("DELETE FROM saved_ideas WHERE id = $1 AND user_id = $2", [savedIdeaId, user.id])

      // Log user activity
      await executeQuery(
        "INSERT INTO user_activity (user_id, activity_type, description, related_id) VALUES ($1, $2, $3, $4)",
        [user.id, "REMOVE_SAVED_IDEA", "Removed a saved business idea", businessIdeaId],
      )

      // Commit the transaction
      await executeQuery("COMMIT")

      revalidatePath("/dashboard/saved-ideas")

      return { success: true }
    } catch (error) {
      // Rollback the transaction on error
      await executeQuery("ROLLBACK")
      throw error
    }
  } catch (error) {
    console.error("Remove saved idea error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
    const errorCode = error instanceof Error && (error as any).code ? (error as any).code : "UNKNOWN_ERROR"

    return {
      success: false,
      message: `Failed to remove saved idea: ${errorMessage}`,
      code: errorCode,
    }
  }
}

// Helper function to get budget range
function getBudgetRange(budget: string) {
  switch (budget) {
    case "0-10000":
      return "5,000 - 10,000 KES"
    case "10000-50000":
      return "15,000 - 40,000 KES"
    case "50000-100000":
      return "60,000 - 90,000 KES"
    case "100000+":
      return "100,000+ KES"
    default:
      return "various"
  }
}
