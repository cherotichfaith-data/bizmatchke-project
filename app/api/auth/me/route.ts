import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function GET() {
  try {
    const cookieStore = cookies()
    const authCookie = cookieStore.get("auth")

    if (!authCookie?.value) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    const userId = authCookie.value

    const users = await executeQuery("SELECT id, name, email, is_admin FROM users WHERE id = $1", [userId])

    if (!users || users.length === 0) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    const user = users[0]

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.is_admin,
      },
    })
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
