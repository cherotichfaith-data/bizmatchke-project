import { executeQuery } from "@/lib/db"
import { NextResponse } from "next/server"
import { isAdmin } from "@/app/actions/auth"

export async function GET() {
  try {
    // Check if user is admin
    const admin = await isAdmin()

    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const result = await executeQuery<any[]>("SELECT COUNT(*) as count FROM business_ideas")

    return NextResponse.json({
      success: true,
      count: Number.parseInt(result[0].count),
    })
  } catch (error) {
    console.error("Error fetching business ideas count:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch business ideas count" }, { status: 500 })
  }
}
