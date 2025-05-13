"use server"

import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"
import { executeQuery } from "@/lib/db"
import bcrypt from "bcryptjs"
import { unstable_cache } from "next/cache"

// Type definitions
export interface User {
  id: number
  name: string
  email: string
  bio?: string
  location?: string
  created_at: Date
  is_admin: boolean
}

// Constants
const SESSION_COOKIE_NAME = "auth_session"
const SESSION_EXPIRY = 60 * 5 // 5 minutes in seconds

// Types
type LoginResult = {
  success: boolean
  message: string
  redirect?: string
}

type LogoutResult = {
  success: boolean
  message: string
}

type RegisterResult = {
  success: boolean
  message: string
  redirect?: string
}

// Login user
export async function loginUser(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return {
      success: false,
      message: "Email and password are required",
    }
  }

  try {
    console.log("Auth: Attempting login for email:", email)

    // Get user from database
    const result = await executeQuery("SELECT * FROM users WHERE email = $1", [email])
    console.log("Auth: Database query result:", result ? "Result received" : "No result")

    // Check if we got any users
    if (!result || !Array.isArray(result) || result.length === 0) {
      console.log("Auth: No user found with this email")
      return {
        success: false,
        message: "Invalid email or password",
      }
    }

    const user = result[0]

    if (!user) {
      console.log("Auth: User object is null or undefined")
      return {
        success: false,
        message: "Invalid email or password",
      }
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password_hash)
    console.log("Auth: Password match:", passwordMatch)

    if (!passwordMatch) {
      return {
        success: false,
        message: "Invalid email or password",
      }
    }

    // Set cookies
    console.log("Auth: Setting cookies for user ID:", user.id)
    setCookiesForUser(user)

    // Update last login (don't wait for this)
    executeQuery("UPDATE users SET last_login = NOW() WHERE id = $1", [user.id]).catch((error) =>
      console.error("Failed to update last login:", error),
    )

    // Log activity (don't wait for this)
    executeQuery("INSERT INTO user_activity (user_id, activity_type, description) VALUES ($1, $2, $3)", [
      user.id,
      "login",
      "User logged in",
    ]).catch((error) => console.error("Failed to log user activity:", error))

    console.log("Auth: Login successful, redirecting to:", user.is_admin ? "/admin" : "/dashboard")
    return {
      success: true,
      message: "Login successful",
      redirect: user.is_admin ? "/admin" : "/dashboard",
    }
  } catch (error) {
    console.error("Login error:", error)
    return {
      success: false,
      message: "An error occurred during login. Please try again later.",
    }
  }
}

// Helper function to set cookies for a user
function setCookiesForUser(user: any) {
  const fiveMinutes = 5 * 60 * 1000 // 5 minutes in milliseconds
  const cookieStore = cookies()

  // Set auth cookie for middleware
  cookieStore.set("auth", "true", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: Date.now() + fiveMinutes,
    path: "/",
  })

  // Set user cookie with minimal user data for middleware
  cookieStore.set(
    "user",
    JSON.stringify({
      id: user.id,
      name: user.name,
      email: user.email,
      is_admin: user.is_admin,
    }),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: Date.now() + fiveMinutes,
      path: "/",
    },
  )

  // Keep the session cookie for backward compatibility
  cookieStore.set("session", String(user.id), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: Date.now() + fiveMinutes,
    path: "/",
  })
}

// Register user
export async function registerUser(formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string

  if (!name || !email || !password || !confirmPassword) {
    return {
      success: false,
      message: "All fields are required",
    }
  }

  if (password !== confirmPassword) {
    return {
      success: false,
      message: "Passwords do not match",
    }
  }

  try {
    // Check if user already exists
    const checkResult = await executeQuery("SELECT * FROM users WHERE email = $1", [email])

    if (Array.isArray(checkResult) && checkResult.length > 0) {
      return {
        success: false,
        message: "Email already in use",
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Insert user
    const result = await executeQuery(
      "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, is_admin",
      [name, email, hashedPassword],
    )

    const user = Array.isArray(result) ? result[0] : null

    if (!user) {
      return {
        success: false,
        message: "Failed to create user",
      }
    }

    // Set cookies
    setCookiesForUser(user)

    // Log activity (don't wait for this)
    executeQuery("INSERT INTO user_activity (user_id, activity_type, description) VALUES ($1, $2, $3)", [
      user.id,
      "register",
      "User registered",
    ]).catch((error) => console.error("Failed to log user activity:", error))

    return {
      success: true,
      message: "Registration successful",
      redirect: "/dashboard",
    }
  } catch (error) {
    console.error("Registration error:", error)
    return {
      success: false,
      message: "An error occurred during registration. Please try again later.",
    }
  }
}

// Function to extract cookie value from cookie string
function extractCookieValue(cookieHeader: string, name: string): string | null {
  const match = new RegExp(`${name}=([^;]+)`).exec(cookieHeader)
  return match?.[1] ?? null
}

// Cached function to get user data from session ID
const getUserFromSessionId = unstable_cache(
  async (sessionId: string) => {
    try {
      console.log("Auth: Getting user data for session ID:", sessionId)
      const result = await executeQuery("SELECT id, name, email, is_admin FROM users WHERE id = $1", [
        Number.parseInt(sessionId),
      ])
      console.log("Auth: User data result:", result ? "Data found" : "No data found")
      return Array.isArray(result) && result.length > 0 ? result[0] : null
    } catch (error) {
      console.error("Error fetching user from session ID:", error)
      return null
    }
  },
  ["user-from-session"],
  { revalidate: 10 }, // Revalidate every 10 seconds
)

// Get current user
export async function getCurrentUser() {
  try {
    console.log("Auth: Getting current user...")
    const headersList = await headers() // ✅ Await headers
    const cookieHeader = headersList.get("cookie") || "" // ✅ Safe access
    console.log("Auth: Cookie header length:", cookieHeader.length)

    // Extract session ID using pure sync function
    const sessionId = extractCookieValue(cookieHeader, "session")
    console.log("Auth: Session ID:", sessionId ? "Found" : "Not found")

    if (!sessionId) {
      // Try to get user from user cookie
      const userCookie = extractCookieValue(cookieHeader, "user")
      console.log("Auth: User cookie:", userCookie ? "Found" : "Not found")

      if (userCookie) {
        try {
          const userData = JSON.parse(decodeURIComponent(userCookie))
          console.log("Auth: Parsed user data from cookie:", userData ? "Success" : "Failed")
          return userData
        } catch (e) {
          console.error("Failed to parse user cookie:", e)
        }
      }
      console.log("Auth: No user found in cookies")
      return null
    }

    // Get user data from session ID using cached function
    const userData = await getUserFromSessionId(sessionId)
    console.log("Auth: User data from database:", userData ? "Found" : "Not found")
    return userData
  } catch (error) {
    console.error("Get current user error:", error)
    return null
  }
}

// Logout user
export async function logoutUser() {
  try {
    console.log("Auth: Logging out user...")
    const cookieStore = cookies()
    cookieStore.delete("session")
    cookieStore.delete("auth")
    cookieStore.delete("user")
    console.log("Auth: Cookies deleted")

    return {
      success: true,
      message: "Logout successful",
    }
  } catch (error) {
    console.error("Logout error:", error)
    return {
      success: false,
      message: "An error occurred during logout",
    }
  }
}

// Admin check middleware
export async function adminCheck() {
  const user = await getCurrentUser()

  if (!user || !user.is_admin) {
    redirect("/login")
  }

  return user
}

// Check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser()
  return !!user
}

// Check if user is admin
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser()
  return user?.is_admin === true
}

/**
 * Get current session from cookie
 */
export async function getCurrentSession() {
  try {
    const headersList = await headers() // ✅ Await headers
    const cookieHeader = headersList.get("cookie") || ""

    // Extract session cookie using pure sync function
    const sessionCookie = extractCookieValue(cookieHeader, SESSION_COOKIE_NAME)

    if (!sessionCookie) {
      return null
    }

    return JSON.parse(decodeURIComponent(sessionCookie))
  } catch (error) {
    console.error("Parse session error:", error)
    return null
  }
}

/**
 * Require authentication middleware
 */
export async function requireAuth() {
  if (!(await isAuthenticated())) {
    redirect("/login")
  }
}

/**
 * Require admin middleware
 */
export async function requireAdmin() {
  if (!(await isAdmin())) {
    redirect("/dashboard")
  }
}
