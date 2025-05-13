"use server"

import { executeQuery } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function seedInitialData() {
  try {
    // Check if we already have users
    const existingUsers = await executeQuery<any[]>("SELECT COUNT(*) as count FROM users")

    if (existingUsers[0].count > 0) {
      return { success: true, message: "Data already seeded" }
    }

    // Create admin user
    const salt = await bcrypt.genSalt(10)
    const adminPasswordHash = await bcrypt.hash("admin123", salt)

    await executeQuery(
      `INSERT INTO users (name, email, password_hash, is_admin, location) 
       VALUES ($1, $2, $3, $4, $5)`,
      ["Admin User", "admin@bizmatchke.co.ke", adminPasswordHash, true, "Nairobi"],
    )

    // Create regular user
    const userPasswordHash = await bcrypt.hash("user123", salt)

    await executeQuery(
      `INSERT INTO users (name, email, password_hash, location) 
       VALUES ($1, $2, $3, $4)`,
      ["John Doe", "john@example.com", userPasswordHash, "Mombasa"],
    )

    // Add skills
    const skills = ["Programming", "Marketing", "Design", "Sales", "Writing", "Teaching", "Cooking", "Farming"]

    for (const skill of skills) {
      await executeQuery("INSERT INTO skills (name) VALUES ($1) ON CONFLICT DO NOTHING", [skill])
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
    ]

    for (const interest of interests) {
      await executeQuery("INSERT INTO interests (name) VALUES ($1) ON CONFLICT DO NOTHING", [interest])
    }

    // Add some resources
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
    ]

    for (const resource of resources) {
      await executeQuery(
        `INSERT INTO resources (title, description, type, url, created_by) 
         VALUES ($1, $2, $3, $4, (SELECT id FROM users WHERE is_admin = true LIMIT 1))`,
        [resource.title, resource.description, resource.type, resource.url],
      )
    }

    return { success: true, message: "Initial data seeded successfully" }
  } catch (error) {
    console.error("Error seeding data:", error)
    return { success: false, message: "Failed to seed data" }
  }
}
