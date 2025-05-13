import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import bcrypt from "bcryptjs"
import { executeQuery } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Find user by email
    const users = await executeQuery("SELECT * FROM users WHERE email = $1", [email])

    if (!users || users.length === 0) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    const user = users[0]

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash)

    if (!passwordMatch) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Update last login time
    await executeQuery("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1", [user.id])

    // Set cookies
    const cookieStore = cookies()

    // Set auth cookie with user ID
    cookieStore.set("auth", String(user.id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    })

    // Determine redirect path based on user role
    const redirectPath = user.is_admin ? "/admin" : "/dashboard"

    return NextResponse.json({
      success: true,
      redirect: redirectPath,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
