"use client"

import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lightbulb, Star, Clock, ChevronRight, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function Dashboard() {
  const { user, isLoading, refreshUser, authError } = useAuth()
  const router = useRouter()
  const [localLoading, setLocalLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Set up a timer to refresh the user data every 4 minutes to prevent session expiry
  useEffect(() => {
    const interval = setInterval(
      () => {
        refreshUser().catch((err) => {
          console.error("Error refreshing user in interval:", err)
        })
      },
      4 * 60 * 1000,
    ) // 4 minutes

    return () => clearInterval(interval)
  }, [refreshUser])

  useEffect(() => {
    // Refresh user data when the dashboard loads
    const checkAuth = async () => {
      try {
        setLocalLoading(true)
        setError(null)
        console.log("Dashboard: Checking authentication...")
        const userData = await refreshUser()
        console.log("Dashboard: User data received:", userData)
        if (!userData) {
          console.log("Dashboard: No user data, redirecting to login...")
          setError("Authentication failed. Please log in again.")
          setTimeout(() => {
            router.push("/login")
          }, 2000) // Short delay to show the error message
        }
      } catch (err) {
        console.error("Dashboard: Error checking auth:", err)
        setError("An error occurred while checking authentication. Please try again.")
      } finally {
        setLocalLoading(false)
      }
    }

    checkAuth()
  }, [refreshUser, router])

  // If loading, show a loading spinner
  if (isLoading || localLoading) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  // If there's an error, show the error message
  if (error || authError) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <h2 className="text-xl font-semibold">Authentication Error</h2>
          <p className="text-muted-foreground">{error || authError}</p>
          <Button onClick={() => router.push("/login")}>Go to Login</Button>
        </div>
      </div>
    )
  }

  // If no user after loading, show a message and redirect
  if (!user) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  // If we have a user, render the dashboard
  return (
    <div className="container py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name || "User"}!</h1>
        <p className="text-muted-foreground">Your entrepreneurial journey continues here.</p>
        <div className="mt-2 p-2 bg-yellow-100 text-yellow-800 rounded-md text-sm">
          Note: Your session will expire in 5 minutes of inactivity.
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="border-0 shadow-md h-full bg-card hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-2">
                <Lightbulb className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Generate Ideas</CardTitle>
              <CardDescription>Create new business ideas tailored to your profile</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-primary text-background mt-4">
                <Link href="/dashboard/idea-generator" className="flex items-center justify-between">
                  <span>Start Generating</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border-0 shadow-md h-full bg-card hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-2">
                <Star className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Saved Ideas</CardTitle>
              <CardDescription>View and manage your saved business ideas</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full mt-4">
                <Link href="/dashboard/saved-ideas" className="flex items-center justify-between">
                  <span>View Saved</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="border-0 shadow-md h-full bg-card hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-2">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your recent interactions and generated ideas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-muted-foreground text-sm mt-4">
                No recent activity yet. Start by generating some ideas!
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="border-0 shadow-md bg-card">
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>Follow these steps to make the most of BizMatchKE</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="bg-primary/20 p-2 rounded-full">
                  <span className="text-primary font-bold">1</span>
                </div>
                <div>
                  <h3 className="font-medium">Complete Your Profile</h3>
                  <p className="text-muted-foreground text-sm">
                    Add your skills, interests, and budget to get personalized recommendations
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-primary/20 p-2 rounded-full">
                  <span className="text-primary font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-medium">Generate Business Ideas</h3>
                  <p className="text-muted-foreground text-sm">
                    Use our AI-powered tool to create tailored business ideas
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-primary/20 p-2 rounded-full">
                  <span className="text-primary font-bold">3</span>
                </div>
                <div>
                  <h3 className="font-medium">Save Your Favorites</h3>
                  <p className="text-muted-foreground text-sm">Bookmark ideas you like for future reference</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
