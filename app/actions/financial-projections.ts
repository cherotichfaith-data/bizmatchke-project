"use server"

import { executeQuery } from "@/lib/db"
import { getCurrentUser } from "./auth"
import { revalidatePath } from "next/cache"

// Define the interface for financial projections
export interface FinancialProjection {
  id: number
  business_idea_id: number
  created_by: number
  initial_investment: number
  monthly_expenses: {
    [key: string]: number
  }
  revenue_projections: {
    months: number[]
    values: number[]
  }
  break_even_point: number | null
  profit_margin: number | null
  roi_estimate: number | null
  cash_flow_projection: {
    months: number[]
    values: number[]
  } | null
  created_at: Date
  updated_at: Date
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

// Check if a table exists in the database
async function tableExists(tableName: string): Promise<boolean> {
  try {
    const result = await executeQuery<any[]>(
      `SELECT EXISTS (
         SELECT FROM information_schema.tables 
         WHERE table_schema = 'public' 
         AND table_name = $1
       ) as exists`,
      [tableName],
    )
    return result[0].exists
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error)
    return false
  }
}

// Check if an index exists in the database
async function indexExists(indexName: string): Promise<boolean> {
  try {
    const result = await executeQuery<any[]>(
      `SELECT EXISTS (
         SELECT FROM pg_indexes 
         WHERE indexname = $1
       ) as exists`,
      [indexName],
    )
    return result[0].exists
  } catch (error) {
    console.error(`Error checking if index ${indexName} exists:`, error)
    return false
  }
}

// Create the financial_projections table if it doesn't exist
export async function ensureFinancialProjectionsTable() {
  try {
    // Check if the table already exists
    const exists = await tableExists("financial_projections")

    if (!exists) {
      // Create the table
      await executeQuery(`
        CREATE TABLE financial_projections (
          id SERIAL PRIMARY KEY,
          business_idea_id INTEGER REFERENCES business_ideas(id) ON DELETE CASCADE,
          created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
          initial_investment DECIMAL(12, 2) NOT NULL,
          monthly_expenses JSONB NOT NULL,
          revenue_projections JSONB NOT NULL,
          break_even_point INTEGER,
          profit_margin DECIMAL(5, 2),
          roi_estimate DECIMAL(5, 2),
          cash_flow_projection JSONB,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `)

      console.log("Created financial_projections table")
    }

    // Check if the index already exists
    const indexExists = await executeQuery<any[]>(
      `SELECT EXISTS (
         SELECT FROM pg_indexes 
         WHERE indexname = 'idx_financial_projections_business_idea_id'
       ) as exists`,
    )

    if (!indexExists[0].exists) {
      // Create the index
      await executeQuery(`
        CREATE INDEX idx_financial_projections_business_idea_id 
        ON financial_projections(business_idea_id)
      `)

      console.log("Created index on financial_projections.business_idea_id")
    }

    return { success: true }
  } catch (error) {
    console.error("Error creating financial_projections table:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

// Get a business idea by ID
export async function getBusinessIdeaById(ideaId: number) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return { success: false, message: "User not authenticated" }
    }

    // Get the business idea
    const ideaResult = await executeQuery<any[]>(
      `SELECT 
        bi.id, bi.title, bi.description, bi.budget_range, bi.location, bi.created_at,
        bi.potential_challenges, bi.success_factors, bi.market_trends, 
        bi.success_rate_estimate, bi.estimated_roi, bi.economic_data
       FROM 
        business_ideas bi
       JOIN
        saved_ideas si ON bi.id = si.business_idea_id
       WHERE 
        bi.id = $1 AND si.user_id = $2`,
      [ideaId, user.id],
    )

    if (ideaResult.length === 0) {
      return { success: false, message: "Business idea not found or not saved by you" }
    }

    const idea = ideaResult[0]

    // Debug log to see what's coming from the database
    console.log("Raw data from database:", {
      potential_challenges_type: typeof idea.potential_challenges,
      success_factors_type: typeof idea.success_factors,
      market_trends_type: typeof idea.market_trends,
      economic_data_type: typeof idea.economic_data,
    })

    // Get skills
    const skillsResult = await executeQuery<any[]>(
      `SELECT s.name
       FROM business_idea_skills bis
       JOIN skills s ON bis.skill_id = s.id
       WHERE bis.business_idea_id = $1`,
      [ideaId],
    )

    // Get interests
    const interestsResult = await executeQuery<any[]>(
      `SELECT i.name
       FROM business_idea_interests bii
       JOIN interests i ON bii.interest_id = i.id
       WHERE bii.business_idea_id = $1`,
      [ideaId],
    )

    // Check if financial projections exist
    await ensureFinancialProjectionsTable()

    // Check if the table exists before querying it
    const tableExists = await executeQuery<any[]>(
      `SELECT EXISTS (
         SELECT FROM information_schema.tables 
         WHERE table_schema = 'public' 
         AND table_name = 'financial_projections'
       ) as exists`,
    )

    let hasProjection = false
    if (tableExists[0].exists) {
      const financialResult = await executeQuery<any[]>(
        `SELECT COUNT(*) > 0 as has_projection
         FROM financial_projections
         WHERE business_idea_id = $1`,
        [ideaId],
      )
      hasProjection = financialResult[0].has_projection
    }

    return {
      success: true,
      idea: {
        id: idea.id,
        title: idea.title,
        description: idea.description,
        budget_range: idea.budget_range,
        location: idea.location,
        created_at: idea.created_at,
        skills: skillsResult.map((s) => s.name),
        interests: interestsResult.map((i) => i.name),
        // Use safe JSON parsing for all JSON fields
        potential_challenges: safeJsonParse(idea.potential_challenges, []),
        success_factors: safeJsonParse(idea.success_factors, []),
        market_trends: safeJsonParse(idea.market_trends, []),
        success_rate_estimate: idea.success_rate_estimate,
        estimated_roi: idea.estimated_roi,
        economic_data: safeJsonParse(idea.economic_data, null),
        has_financial_projection: hasProjection,
      },
    }
  } catch (error) {
    console.error("Get business idea error:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

// Create or update financial projections for a business idea
export async function saveFinancialProjection(
  businessIdeaId: number,
  data: {
    initialInvestment: number
    monthlyExpenses: { [key: string]: number }
    revenueProjections: { months: number[]; values: number[] }
  },
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return { success: false, message: "User not authenticated" }
    }

    // Ensure the financial_projections table exists
    await ensureFinancialProjectionsTable()

    // Calculate financial metrics
    const totalMonthlyExpenses = Object.values(data.monthlyExpenses).reduce((sum, value) => sum + value, 0)

    // Calculate break-even point (in months)
    let breakEvenPoint = null
    let profitMargin = null
    let roiEstimate = null
    let cashFlowProjection = null

    if (data.revenueProjections.values.length > 0) {
      // Calculate cumulative cash flow
      const cumulativeCashFlow = []
      let runningTotal = -data.initialInvestment

      for (let i = 0; i < data.revenueProjections.values.length; i++) {
        const monthlyRevenue = data.revenueProjections.values[i]
        const monthlyProfit = monthlyRevenue - totalMonthlyExpenses
        runningTotal += monthlyProfit
        cumulativeCashFlow.push(runningTotal)
      }

      // Find break-even point (first month where cumulative cash flow becomes positive)
      breakEvenPoint = cumulativeCashFlow.findIndex((value) => value >= 0) + 1
      if (breakEvenPoint === 0) breakEvenPoint = null

      // Calculate profit margin based on the last month's revenue
      const lastMonthRevenue = data.revenueProjections.values[data.revenueProjections.values.length - 1]
      if (lastMonthRevenue > 0) {
        profitMargin = ((lastMonthRevenue - totalMonthlyExpenses) / lastMonthRevenue) * 100
      }

      // Calculate ROI after 12 months
      if (data.revenueProjections.values.length >= 12) {
        const totalRevenue = data.revenueProjections.values.slice(0, 12).reduce((sum, value) => sum + value, 0)
        const totalExpenses = totalMonthlyExpenses * 12
        const profit = totalRevenue - totalExpenses
        roiEstimate = (profit / data.initialInvestment) * 100
      }

      // Store cash flow projection
      cashFlowProjection = {
        months: data.revenueProjections.months,
        values: cumulativeCashFlow,
      }
    }

    // Start a transaction
    await executeQuery("BEGIN")

    try {
      // Check if the business idea exists and is saved by the user
      const ideaResult = await executeQuery<any[]>(
        `SELECT bi.id
         FROM business_ideas bi
         JOIN saved_ideas si ON bi.id = si.business_idea_id
         WHERE bi.id = $1 AND si.user_id = $2`,
        [businessIdeaId, user.id],
      )

      if (ideaResult.length === 0) {
        await executeQuery("ROLLBACK")
        return { success: false, message: "Business idea not found or not saved by you" }
      }

      // Check if financial projections already exist for this idea
      const existingResult = await executeQuery<any[]>(
        "SELECT id FROM financial_projections WHERE business_idea_id = $1",
        [businessIdeaId],
      )

      if (existingResult.length > 0) {
        // Update existing projections
        await executeQuery(
          `UPDATE financial_projections
           SET initial_investment = $1,
               monthly_expenses = $2,
               revenue_projections = $3,
               break_even_point = $4,
               profit_margin = $5,
               roi_estimate = $6,
               cash_flow_projection = $7,
               updated_at = CURRENT_TIMESTAMP
           WHERE business_idea_id = $8`,
          [
            data.initialInvestment,
            JSON.stringify(data.monthlyExpenses),
            JSON.stringify(data.revenueProjections),
            breakEvenPoint,
            profitMargin,
            roiEstimate,
            JSON.stringify(cashFlowProjection),
            businessIdeaId,
          ],
        )
      } else {
        // Create new projections
        await executeQuery(
          `INSERT INTO financial_projections
           (business_idea_id, created_by, initial_investment, monthly_expenses, revenue_projections,
            break_even_point, profit_margin, roi_estimate, cash_flow_projection)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            businessIdeaId,
            user.id,
            data.initialInvestment,
            JSON.stringify(data.monthlyExpenses),
            JSON.stringify(data.revenueProjections),
            breakEvenPoint,
            profitMargin,
            roiEstimate,
            JSON.stringify(cashFlowProjection),
          ],
        )
      }

      // Log user activity
      await executeQuery(
        "INSERT INTO user_activity (user_id, activity_type, description, related_id) VALUES ($1, $2, $3, $4)",
        [user.id, "FINANCIAL_PROJECTION", "Created/updated financial projections", businessIdeaId],
      )

      // Commit the transaction
      await executeQuery("COMMIT")

      revalidatePath(`/dashboard/financial-projections/${businessIdeaId}`)

      return {
        success: true,
        projection: {
          initialInvestment: data.initialInvestment,
          monthlyExpenses: data.monthlyExpenses,
          revenueProjections: data.revenueProjections,
          breakEvenPoint,
          profitMargin,
          roiEstimate,
          cashFlowProjection,
        },
      }
    } catch (error) {
      // Rollback the transaction on error
      await executeQuery("ROLLBACK")
      throw error
    }
  } catch (error) {
    console.error("Save financial projection error:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

// Get financial projections for a business idea
export async function getFinancialProjection(businessIdeaId: number) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return { success: false, message: "User not authenticated" }
    }

    // Ensure the financial_projections table exists
    await ensureFinancialProjectionsTable()

    // Check if the business idea exists and is saved by the user
    const ideaResult = await executeQuery<any[]>(
      `SELECT bi.id
       FROM business_ideas bi
       JOIN saved_ideas si ON bi.id = si.business_idea_id
       WHERE bi.id = $1 AND si.user_id = $2`,
      [businessIdeaId, user.id],
    )

    if (ideaResult.length === 0) {
      return { success: false, message: "Business idea not found or not saved by you" }
    }

    // Get the financial projections
    const projectionResult = await executeQuery<any[]>(
      `SELECT *
       FROM financial_projections
       WHERE business_idea_id = $1`,
      [businessIdeaId],
    )

    if (projectionResult.length === 0) {
      return { success: false, message: "Financial projections not found", code: "NOT_FOUND" }
    }

    const projection = projectionResult[0]

    return {
      success: true,
      projection: {
        id: projection.id,
        businessIdeaId: projection.business_idea_id,
        initialInvestment: Number.parseFloat(projection.initial_investment),
        monthlyExpenses: projection.monthly_expenses,
        revenueProjections: projection.revenue_projections,
        breakEvenPoint: projection.break_even_point,
        profitMargin: Number.parseFloat(projection.profit_margin),
        roiEstimate: Number.parseFloat(projection.roi_estimate),
        cashFlowProjection: projection.cash_flow_projection,
        createdAt: projection.created_at,
        updatedAt: projection.updated_at,
      },
    }
  } catch (error) {
    console.error("Get financial projection error:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}
