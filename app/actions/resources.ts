"use server"

import { executeQuery } from "@/lib/db"
import { getCurrentUser, isAdmin } from "./auth"
import { revalidatePath } from "next/cache"

// Get all resources
export async function getResources(type?: string) {
  try {
    let query = `
      SELECT id, title, description, type, url, created_at
      FROM resources
    `

    const params: any[] = []

    if (type && type !== "all") {
      query += " WHERE type = $1"
      params.push(type)
    }

    query += " ORDER BY created_at DESC"

    const resources = await executeQuery<any[]>(query, params)

    return { success: true, resources }
  } catch (error) {
    console.error("Get resources error:", error)
    return { success: false, message: "Failed to get resources" }
  }
}

// Add a new resource (admin only)
export async function addResource(formData: FormData) {
  const user = await getCurrentUser()
  const admin = await isAdmin()

  if (!user) {
    return { success: false, message: "User not authenticated" }
  }

  if (!admin) {
    return { success: false, message: "Unauthorized: Admin access required" }
  }

  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const type = formData.get("type") as string
  const url = formData.get("url") as string

  try {
    await executeQuery(
      "INSERT INTO resources (title, description, type, url, created_by) VALUES ($1, $2, $3, $4, $5)",
      [title, description, type, url, user.id],
    )

    // Log admin activity
    await executeQuery("INSERT INTO user_activity (user_id, activity_type, description) VALUES ($1, $2, $3)", [
      user.id,
      "ADD_RESOURCE",
      `Added resource: ${title}`,
    ])

    revalidatePath("/dashboard/resources")
    revalidatePath("/admin/resources")

    return { success: true }
  } catch (error) {
    console.error("Add resource error:", error)
    return { success: false, message: "Failed to add resource" }
  }
}

// Delete a resource (admin only)
export async function deleteResource(resourceId: number) {
  const user = await getCurrentUser()
  const admin = await isAdmin()

  if (!user) {
    return { success: false, message: "User not authenticated" }
  }

  if (!admin) {
    return { success: false, message: "Unauthorized: Admin access required" }
  }

  try {
    // Get resource title for activity log
    const resourceResult = await executeQuery<any[]>("SELECT title FROM resources WHERE id = $1", [resourceId])

    if (resourceResult.length === 0) {
      return { success: false, message: "Resource not found" }
    }

    const resourceTitle = resourceResult[0].title

    // Delete the resource
    await executeQuery("DELETE FROM resources WHERE id = $1", [resourceId])

    // Log admin activity
    await executeQuery("INSERT INTO user_activity (user_id, activity_type, description) VALUES ($1, $2, $3)", [
      user.id,
      "DELETE_RESOURCE",
      `Deleted resource: ${resourceTitle}`,
    ])

    revalidatePath("/dashboard/resources")
    revalidatePath("/admin/resources")

    return { success: true }
  } catch (error) {
    console.error("Delete resource error:", error)
    return { success: false, message: "Failed to delete resource" }
  }
}
