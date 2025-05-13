"use server"

import { executeQuery } from "@/lib/db"

export async function testDatabaseConnection() {
  try {
    // Simple query to check if the database is connected
    const result = await executeQuery("SELECT 1 as connected")

    if (result && result[0]?.connected === 1) {
      return {
        success: true,
        message: "Database connected successfully",
      }
    } else {
      return {
        success: false,
        message: "Database connection test failed",
      }
    }
  } catch (error) {
    console.error("Database status check error:", error)
    return {
      success: false,
      message: "Database connection error",
    }
  }
}

export async function getUsersCount() {
  try {
    const result = await executeQuery<any[]>("SELECT COUNT(*) as count FROM users")
    return {
      success: true,
      count: Number.parseInt(result[0].count),
    }
  } catch (error) {
    console.error("Error getting users count:", error)
    return {
      success: false,
      count: 0,
    }
  }
}

export async function getResourcesCount() {
  try {
    const result = await executeQuery<any[]>("SELECT COUNT(*) as count FROM resources")
    return {
      success: true,
      count: Number.parseInt(result[0].count),
    }
  } catch (error) {
    console.error("Error getting resources count:", error)
    return {
      success: false,
      count: 0,
    }
  }
}

export async function getSkillsAndInterests() {
  try {
    const skillsResult = await executeQuery<any[]>("SELECT name FROM skills ORDER BY name")
    const interestsResult = await executeQuery<any[]>("SELECT name FROM interests ORDER BY name")

    return {
      success: true,
      skills: skillsResult.map((s) => s.name),
      interests: interestsResult.map((i) => i.name),
    }
  } catch (error) {
    console.error("Error getting skills and interests:", error)
    return {
      success: false,
      skills: [],
      interests: [],
    }
  }
}
