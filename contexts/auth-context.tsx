"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { getCurrentUser, logoutUser } from "@/app/actions/auth"
import { useRouter } from "next/navigation"

type User = {
  id: number
  name: string
  email: string
  is_admin?: boolean
} | null

interface AuthContextType {
  user: User
  logout: () => Promise<void>
  isLoading: boolean
  refreshUser: () => Promise<User>
  authError: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)
  const router = useRouter()

  // Function to refresh user data
  const refreshUser = async () => {
    try {
      setIsLoading(true)
      setAuthError(null)
      const userData = await getCurrentUser()
      setUser(userData)
      return userData
    } catch (error) {
      console.error("Error refreshing user:", error)
      setAuthError("Failed to refresh user data. Please try logging in again.")
      setUser(null)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // Check if user is already logged in on mount
  useEffect(() => {
    let isMounted = true

    const fetchUser = async () => {
      if (!isMounted) return

      setIsLoading(true)
      try {
        const userData = await getCurrentUser()
        if (isMounted) {
          console.log("Auth context received user data:", userData)
          setUser(userData)
        }
      } catch (error) {
        console.error("Error fetching user:", error)
        if (isMounted) {
          setAuthError("Failed to fetch user data. Please try logging in again.")
          setUser(null)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchUser()

    return () => {
      isMounted = false
    }
  }, [])

  // Logout function
  const logout = async () => {
    try {
      setIsLoading(true)
      const result = await logoutUser()
      if (result.success) {
        setUser(null)
        // Handle redirect on the client side
        router.push("/")
        router.refresh()
      }
    } catch (error) {
      console.error("Error logging out:", error)
      setAuthError("Failed to log out. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, logout, isLoading, refreshUser, authError }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
