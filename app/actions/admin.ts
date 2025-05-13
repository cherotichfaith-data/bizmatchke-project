"use server"

import { executeQuery } from "@/lib/db"
import { getCurrentUser, isAdmin } from "./auth"
import { revalidatePath } from "next/cache"

// Get all users (admin only)
export async function getAllUsers() {
  const user = await getCurrentUser()
  const admin = await isAdmin()

  if (!user) {
    return { success: false, message: "User not authenticated" }
  }

  if (!admin) {
    return { success: false, message: "Unauthorized: Admin access required" }
  }

  try {
    const users = await executeQuery<any[]>(
      `SELECT id, name, email, location, created_at, last_login, is_admin
       FROM users
       ORDER BY created_at DESC`,
    )

    return { success: true, users }
  } catch (error) {
    console.error("Get all users error:", error)
    return { success: false, message: "Failed to get users" }
  }
}

// Get all business ideas (admin only)
export async function getAllBusinessIdeas() {
  const user = await getCurrentUser()
  const admin = await isAdmin()

  if (!user) {
    return { success: false, message: "User not authenticated" }
  }

  if (!admin) {
    return { success: false, message: "Unauthorized: Admin access required" }
  }

  try {
    const ideas = await executeQuery<any[]>(
      `SELECT bi.id, bi.title, bi.description, bi.budget_range, bi.location, bi.created_at, bi.is_generated,
              u.name as created_by_name, u.email as created_by_email
       FROM business_ideas bi
       LEFT JOIN users u ON bi.created_by = u.id
       ORDER BY bi.created_at DESC`,
    )

    return { success: true, ideas }
  } catch (error) {
    console.error("Get all business ideas error:", error)
    return { success: false, message: "Failed to get business ideas" }
  }
}

// Get dashboard statistics (admin only)
export async function getDashboardStats() {
  const user = await getCurrentUser()
  const admin = await isAdmin()

  if (!user) {
    return { success: false, message: "User not authenticated" }
  }

  if (!admin) {
    return { success: false, message: "Unauthorized: Admin access required" }
  }

  try {
    // Total users
    const totalUsersResult = await executeQuery<any[]>("SELECT COUNT(*) as count FROM users")
    const totalUsers = totalUsersResult[0].count

    // New users in the last 7 days
    const newUsersResult = await executeQuery<any[]>(
      "SELECT COUNT(*) as count FROM users WHERE created_at > NOW() - INTERVAL '7 days'",
    )
    const newUsers = newUsersResult[0].count

    // Total business ideas
    const totalIdeasResult = await executeQuery<any[]>("SELECT COUNT(*) as count FROM business_ideas")
    const totalIdeas = totalIdeasResult[0].count

    // Ideas generated in the last 7 days
    const newIdeasResult = await executeQuery<any[]>(
      "SELECT COUNT(*) as count FROM business_ideas WHERE created_at > NOW() - INTERVAL '7 days'",
    )
    const newIdeas = newIdeasResult[0].count

    // Total saved ideas
    const savedIdeasResult = await executeQuery<any[]>("SELECT COUNT(*) as count FROM saved_ideas")
    const savedIdeas = savedIdeasResult[0].count

    // Active users in the last 7 days
    const activeUsersResult = await executeQuery<any[]>(
      "SELECT COUNT(DISTINCT user_id) as count FROM user_activity WHERE created_at > NOW() - INTERVAL '7 days'",
    )
    const activeUsers = activeUsersResult[0].count

    // Recent activity
    const recentActivityResult = await executeQuery<any[]>(
      `SELECT ua.id, ua.activity_type, ua.description, ua.created_at, u.name as user_name
       FROM user_activity ua
       JOIN users u ON ua.user_id = u.id
       ORDER BY ua.created_at DESC
       LIMIT 10`,
    )

    return {
      success: true,
      stats: {
        totalUsers,
        newUsers,
        totalIdeas,
        newIdeas,
        savedIdeas,
        activeUsers,
        recentActivity: recentActivityResult,
      },
    }
  } catch (error) {
    console.error("Get dashboard stats error:", error)
    return { success: false, message: "Failed to get dashboard statistics" }
  }
}

// Make a user an admin (admin only)
export async function makeUserAdmin(userId: number) {
  const user = await getCurrentUser()
  const admin = await isAdmin()

  if (!user) {
    return { success: false, message: "User not authenticated" }
  }

  if (!admin) {
    return { success: false, message: "Unauthorized: Admin access required" }
  }

  try {
    // Get user name for activity log
    const userResult = await executeQuery<any[]>("SELECT name FROM users WHERE id = $1", [userId])

    if (userResult.length === 0) {
      return { success: false, message: "User not found" }
    }

    const userName = userResult[0].name

    // Update user to admin
    await executeQuery("UPDATE users SET is_admin = TRUE WHERE id = $1", [userId])

    // Log admin activity
    await executeQuery(
      "INSERT INTO user_activity (user_id, activity_type, description, related_id) VALUES ($1, $2, $3, $4)",
      [user.id, "MAKE_ADMIN", `Made user ${userName} an admin`, userId],
    )

    revalidatePath("/admin/users")

    return { success: true }
  } catch (error) {
    console.error("Make user admin error:", error)
    return { success: false, message: "Failed to make user an admin" }
  }
}

// Remove admin privileges (admin only)
export async function removeAdminPrivileges(userId: number) {
  const user = await getCurrentUser()
  const admin = await isAdmin()

  if (!user) {
    return { success: false, message: "User not authenticated" }
  }

  if (!admin) {
    return { success: false, message: "Unauthorized: Admin access required" }
  }

  // Prevent removing admin privileges from yourself
  if (userId === user.id) {
    return { success: false, message: "Cannot remove admin privileges from yourself" }
  }

  try {
    // Get user name for activity log
    const userResult = await executeQuery<any[]>("SELECT name FROM users WHERE id = $1", [userId])

    if (userResult.length === 0) {
      return { success: false, message: "User not found" }
    }

    const userName = userResult[0].name

    // Update user to remove admin privileges
    await executeQuery("UPDATE users SET is_admin = FALSE WHERE id = $1", [userId])

    // Log admin activity
    await executeQuery(
      "INSERT INTO user_activity (user_id, activity_type, description, related_id) VALUES ($1, $2, $3, $4)",
      [user.id, "REMOVE_ADMIN", `Removed admin privileges from user ${userName}`, userId],
    )

    revalidatePath("/admin/users")

    return { success: true }
  } catch (error) {
    console.error("Remove admin privileges error:", error)
    return { success: false, message: "Failed to remove admin privileges" }
  }
}
