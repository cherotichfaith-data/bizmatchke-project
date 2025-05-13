"use server"

import { executeQuery } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function seedDatabase() {
  try {
    // Check if we already have users
    const existingUsers = await executeQuery<any[]>("SELECT COUNT(*) as count FROM users")

    if (existingUsers[0].count > 0) {
      return { success: true, message: "Database already seeded" }
    }

    // Create admin user
    const salt = await bcrypt.genSalt(10)
    const adminPasswordHash = await bcrypt.hash("admin123", salt)

    const adminResult = await executeQuery<any[]>(
      `INSERT INTO users (name, email, password_hash, is_admin, location, bio) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [
        "Admin User",
        "admin@bizmatchke.co.ke",
        adminPasswordHash,
        true,
        "Nairobi",
        "Platform administrator with experience in business development and entrepreneurship.",
      ],
    )

    const adminId = adminResult[0].id

    // Create regular user
    const userPasswordHash = await bcrypt.hash("user123", salt)

    const userResult = await executeQuery<any[]>(
      `INSERT INTO users (name, email, password_hash, location, bio) 
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [
        "John Doe",
        "john@example.com",
        userPasswordHash,
        "Mombasa",
        "Aspiring entrepreneur with interests in technology and agriculture.",
      ],
    )

    const userId = userResult[0].id

    // Add skills
    const skills = [
      "Programming",
      "Marketing",
      "Design",
      "Sales",
      "Writing",
      "Teaching",
      "Cooking",
      "Farming",
      "Accounting",
      "Management",
    ]

    for (const skill of skills) {
      await executeQuery("INSERT INTO skills (name) VALUES ($1) ON CONFLICT (name) DO NOTHING", [skill])
    }

    // Add interests
    const interests = [
      "Technology",
      "Agriculture",
      "Food & Beverage",
      "Fashion",
      "Services",
      "Retail",
      "Education",
      "Healthcare",
      "Transportation",
      "Entertainment",
    ]

    for (const interest of interests) {
      await executeQuery("INSERT INTO interests (name) VALUES ($1) ON CONFLICT (name) DO NOTHING", [interest])
    }

    // Associate skills and interests with users
    // For admin user
    await associateUserSkills(adminId, ["Management", "Marketing", "Sales"])
    await associateUserInterests(adminId, ["Technology", "Education", "Services"])

    // For regular user
    await associateUserSkills(userId, ["Programming", "Design", "Writing"])
    await associateUserInterests(userId, ["Technology", "Agriculture", "Food & Beverage"])

    // Add user preferences
    await executeQuery(
      `INSERT INTO user_preferences (user_id, theme, email_notifications, save_generated_ideas, language) 
       VALUES ($1, $2, $3, $4, $5)`,
      [adminId, "dark", true, true, "en"],
    )

    await executeQuery(
      `INSERT INTO user_preferences (user_id, theme, email_notifications, save_generated_ideas, language) 
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, "dark", true, false, "en"],
    )

    // Add resources
    const resources = [
      {
        title: "Starting a Business in Kenya: Legal Requirements",
        description: "A comprehensive guide to the legal requirements for starting a business in Kenya.",
        type: "article",
        url: "https://example.com/legal-guide",
      },
      {
        title: "How to Create a Business Plan",
        description: "Step-by-step guide to creating a compelling business plan for your new venture.",
        type: "guide",
        url: "https://example.com/business-plan",
      },
      {
        title: "Funding Options for Kenyan Entrepreneurs",
        description: "Explore various funding options available to entrepreneurs in Kenya.",
        type: "article",
        url: "https://example.com/funding",
      },
      {
        title: "Marketing Strategies for Small Businesses",
        description: "Effective marketing strategies for small businesses with limited budgets.",
        type: "video",
        url: "https://example.com/marketing",
      },
      {
        title: "Financial Projection Template",
        description: "Excel template for creating financial projections for your business.",
        type: "template",
        url: "https://example.com/financial-template",
      },
    ]

    for (const resource of resources) {
      await executeQuery(
        `INSERT INTO resources (title, description, type, url, created_by) 
         VALUES ($1, $2, $3, $4, $5)`,
        [resource.title, resource.description, resource.type, resource.url, adminId],
      )
    }

    // Add sample business ideas
    const businessIdeas = [
      {
        title: "Mobile App Development Agency",
        description:
          "A service-based business offering mobile app development for local businesses in Kenya. Focus on creating affordable, functional apps for SMEs.",
        budget_range: "100,000+ KES",
        location: "Nairobi",
        skills: ["Programming", "Design", "Marketing"],
        interests: ["Technology", "Services"],
      },
      {
        title: "Organic Farm Produce Delivery",
        description:
          "A subscription-based service delivering fresh organic produce from local farms to urban consumers. Emphasis on sustainability and supporting local farmers.",
        budget_range: "50,000 - 100,000 KES",
        location: "Nairobi",
        skills: ["Farming", "Management", "Marketing"],
        interests: ["Agriculture", "Food & Beverage"],
      },
      {
        title: "E-learning Platform for Vocational Skills",
        description:
          "An online platform offering courses on practical vocational skills relevant to the Kenyan job market. Targeting young adults seeking employment or entrepreneurship opportunities.",
        budget_range: "50,000 - 100,000 KES",
        location: "Mombasa",
        skills: ["Teaching", "Programming", "Marketing"],
        interests: ["Education", "Technology"],
      },
    ]

    for (const idea of businessIdeas) {
      const ideaResult = await executeQuery<any[]>(
        `INSERT INTO business_ideas (title, description, budget_range, location, created_by, is_generated) 
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [idea.title, idea.description, idea.budget_range, idea.location, adminId, true],
      )

      const ideaId = ideaResult[0].id

      // Associate skills with business idea
      await associateBusinessIdeaSkills(ideaId, idea.skills)

      // Associate interests with business idea
      await associateBusinessIdeaInterests(ideaId, idea.interests)

      // Save the idea for the regular user
      if (idea.title === "Mobile App Development Agency") {
        await executeQuery(
          `INSERT INTO saved_ideas (user_id, business_idea_id, notes) 
           VALUES ($1, $2, $3)`,
          [userId, ideaId, "This aligns well with my programming skills. Need to research the local market more."],
        )
      }
    }

    // Add some user activity
    await executeQuery(
      `INSERT INTO user_activity (user_id, activity_type, description) 
       VALUES ($1, $2, $3)`,
      [userId, "LOGIN", "User logged in"],
    )

    await executeQuery(
      `INSERT INTO user_activity (user_id, activity_type, description) 
       VALUES ($1, $2, $3)`,
      [userId, "GENERATE_IDEAS", "Generated business ideas"],
    )

    await executeQuery(
      `INSERT INTO user_activity (user_id, activity_type, description, related_id) 
       VALUES ($1, $2, $3, $4)`,
      [userId, "SAVE_IDEA", "Saved a business idea", 1],
    )

    return { success: true, message: "Database seeded successfully" }
  } catch (error) {
    console.error("Error seeding database:", error)
    return { success: false, message: "Failed to seed database", error: String(error) }
  }
}

// Helper function to associate skills with a user
async function associateUserSkills(userId: number, skillNames: string[]) {
  for (const skillName of skillNames) {
    // Get skill id
    const skillResult = await executeQuery<any[]>("SELECT id FROM skills WHERE name = $1", [skillName])

    if (skillResult.length > 0) {
      const skillId = skillResult[0].id

      // Associate skill with user
      await executeQuery("INSERT INTO user_skills (user_id, skill_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", [
        userId,
        skillId,
      ])
    }
  }
}

// Helper function to associate interests with a user
async function associateUserInterests(userId: number, interestNames: string[]) {
  for (const interestName of interestNames) {
    // Get interest id
    const interestResult = await executeQuery<any[]>("SELECT id FROM interests WHERE name = $1", [interestName])

    if (interestResult.length > 0) {
      const interestId = interestResult[0].id

      // Associate interest with user
      await executeQuery("INSERT INTO user_interests (user_id, interest_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", [
        userId,
        interestId,
      ])
    }
  }
}

// Helper function to associate skills with a business idea
async function associateBusinessIdeaSkills(ideaId: number, skillNames: string[]) {
  for (const skillName of skillNames) {
    // Get skill id
    const skillResult = await executeQuery<any[]>("SELECT id FROM skills WHERE name = $1", [skillName])

    if (skillResult.length > 0) {
      const skillId = skillResult[0].id

      // Associate skill with business idea
      await executeQuery(
        "INSERT INTO business_idea_skills (business_idea_id, skill_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
        [ideaId, skillId],
      )
    }
  }
}

// Helper function to associate interests with a business idea
async function associateBusinessIdeaInterests(ideaId: number, interestNames: string[]) {
  for (const interestName of interestNames) {
    // Get interest id
    const interestResult = await executeQuery<any[]>("SELECT id FROM interests WHERE name = $1", [interestName])

    if (interestResult.length > 0) {
      const interestId = interestResult[0].id

      // Associate interest with business idea
      await executeQuery(
        "INSERT INTO business_idea_interests (business_idea_id, interest_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
        [ideaId, interestId],
      )
    }
  }
}
