"use server"

import { executeQuery } from "@/lib/db"
import { getCurrentUser } from "./auth"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

// Get user profile
export async function getUserProfile() {
  const user = await getCurrentUser()

  if (!user) {
    return { success: false, message: "User not authenticated" }
  }

  try {
    // Get user details
    const userResult = await executeQuery<any[]>(
      "SELECT id, name, email, bio, location, created_at FROM users WHERE id = $1",
      [user.id],
    )

    if (userResult.length === 0) {
      return { success: false, message: "User not found" }
    }

    const userProfile = userResult[0]

    // Get user skills
    const skillsResult = await executeQuery<any[]>(
      `SELECT s.name
       FROM user_skills us
       JOIN skills s ON us.skill_id = s.id
       WHERE us.user_id = $1`,
      [user.id],
    )

    // Get user interests
    const interestsResult = await executeQuery<any[]>(
      `SELECT i.name
       FROM user_interests ui
       JOIN interests i ON ui.interest_id = i.id
       WHERE ui.user_id = $1`,
      [user.id],
    )

    // Get user preferences
    const preferencesResult = await executeQuery<any[]>(
      "SELECT theme, email_notifications, save_generated_ideas, language FROM user_preferences WHERE user_id = $1",
      [user.id],
    )

    return {
      success: true,
      profile: {
        ...userProfile,
        skills: skillsResult.map((s) => s.name),
        interests: interestsResult.map((i) => i.name),
        preferences: preferencesResult[0] || {
          theme: "dark",
          email_notifications: true,
          save_generated_ideas: false,
          language: "en",
        },
      },
    }
  } catch (error) {
    console.error("Get user profile error:", error)
    return { success: false, message: "Failed to get user profile" }
  }
}

// Update user profile
export async function updateUserProfile(formData: FormData) {
  const user = await getCurrentUser()

  if (!user) {
    return { success: false, message: "User not authenticated" }
  }

  const name = formData.get("name") as string
  const bio = formData.get("bio") as string
  const location = formData.get("location") as string
  const skills = formData.getAll("skills") as string[]
  const interests = formData.getAll("interests") as string[]

  try {
    // Update user details
    await executeQuery(
      "UPDATE users SET name = $1, bio = $2, location = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4",
      [name, bio, location, user.id],
    )

    // Update skills
    // First, remove all existing skills
    await executeQuery("DELETE FROM user_skills WHERE user_id = $1", [user.id])

    // Then add new skills
    for (const skill of skills) {
      // Get or create the skill
      const skillResult = await executeQuery<any[]>(
        "INSERT INTO skills (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = $1 RETURNING id",
        [skill],
      )

      const skillId = skillResult[0].id

      // Associate skill with the user
      await executeQuery("INSERT INTO user_skills (user_id, skill_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", [
        user.id,
        skillId,
      ])
    }

    // Update interests
    // First, remove all existing interests
    await executeQuery("DELETE FROM user_interests WHERE user_id = $1", [user.id])

    // Then add new interests
    for (const interest of interests) {
      // Get or create the interest
      const interestResult = await executeQuery<any[]>(
        "INSERT INTO interests (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = $1 RETURNING id",
        [interest],
      )

      const interestId = interestResult[0].id

      // Associate interest with the user
      await executeQuery("INSERT INTO user_interests (user_id, interest_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", [
        user.id,
        interestId,
      ])
    }

    // Log user activity
    await executeQuery("INSERT INTO user_activity (user_id, activity_type, description) VALUES ($1, $2, $3)", [
      user.id,
      "UPDATE_PROFILE",
      "Updated profile information",
    ])

    // Update the user cookie with the new name
    const userCookie = await getCurrentUser()
    if (userCookie) {
      const cookieStore = cookies()
      cookieStore.set(
        "user",
        JSON.stringify({
          ...userCookie,
          name,
        }),
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 60 * 24 * 7, // 1 week
          path: "/",
        },
      )
    }

    revalidatePath("/dashboard/profile")

    return { success: true }
  } catch (error) {
    console.error("Update user profile error:", error)
    return { success: false, message: "Failed to update user profile" }
  }
}

// Update user preferences
export async function updateUserPreferences(formData: FormData) {
  const user = await getCurrentUser()

  if (!user) {
    return { success: false, message: "User not authenticated" }
  }

  const theme = formData.get("theme") as string
  const emailNotifications = formData.get("emailNotifications") === "on"
  const saveGeneratedIdeas = formData.get("saveGeneratedIdeas") === "on"
  const language = formData.get("language") as string

  try {
    // Update user preferences
    await executeQuery(
      `INSERT INTO user_preferences (user_id, theme, email_notifications, save_generated_ideas, language) 
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id) 
       DO UPDATE SET theme = $2, email_notifications = $3, save_generated_ideas = $4, language = $5`,
      [user.id, theme, emailNotifications, saveGeneratedIdeas, language],
    )

    // Log user activity
    await executeQuery("INSERT INTO user_activity (user_id, activity_type, description) VALUES ($1, $2, $3)", [
      user.id,
      "UPDATE_PREFERENCES",
      "Updated user preferences",
    ])

    revalidatePath("/dashboard/profile")

    return { success: true }
  } catch (error) {
    console.error("Update user preferences error:", error)
    return { success: false, message: "Failed to update user preferences" }
  }
}

// Get user activity history
export async function getUserActivity(limit = 10) {
  const user = await getCurrentUser()

  if (!user) {
    return { success: false, message: "User not authenticated" }
  }

  try {
    const activityResult = await executeQuery<any[]>(
      `SELECT id, activity_type, description, created_at, related_id
       FROM user_activity
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [user.id, limit],
    )

    return { success: true, activity: activityResult }
  } catch (error) {
    console.error("Get user activity error:", error)
    return { success: false, message: "Failed to get user activity" }
  }
}
