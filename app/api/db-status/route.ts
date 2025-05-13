import { executeQuery } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Simple query to check if the database is connected
    const result = await executeQuery("SELECT 1 as connected", [])

    if (result && result[0]?.connected === 1) {
      // Get database stats
      const usersCount = await executeQuery("SELECT COUNT(*) as count FROM users", [])
      const resourcesCount = await executeQuery("SELECT COUNT(*) as count FROM resources", [])
      const ideasCount = await executeQuery("SELECT COUNT(*) as count FROM business_ideas", [])

      return NextResponse.json({
        success: true,
        message: "Database connected successfully",
        stats: {
          users: usersCount[0]?.count || 0,
          resources: resourcesCount[0]?.count || 0,
          ideas: ideasCount[0]?.count || 0,
        },
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Database connection test failed",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Database status check error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Database connection error",
        error: String(error),
      },
      { status: 500 },
    )
  }
}
