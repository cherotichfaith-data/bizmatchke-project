"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { seedDatabase } from "@/app/actions/seed-database"
import { Loader2, Database, CheckCircle, XCircle } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export default function DatabaseSeedPage() {
  const [isSeeding, setIsSeeding] = useState(false)
  const [seedResult, setSeedResult] = useState<{ success: boolean; message: string } | null>(null)
  const [dbStatus, setDbStatus] = useState<{ connected: boolean; message: string } | null>(null)
  const [isCheckingConnection, setIsCheckingConnection] = useState(false)

  const handleSeedDatabase = async () => {
    setIsSeeding(true)
    setSeedResult(null)

    try {
      const result = await seedDatabase()
      setSeedResult(result)

      if (result.success) {
        toast({
          title: "Success",
          description: "Database seeded successfully",
        })
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      setSeedResult({
        success: false,
        message: error instanceof Error ? error.message : "An unexpected error occurred",
      })
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSeeding(false)
    }
  }

  const checkDatabaseConnection = async () => {
    setIsCheckingConnection(true)
    setDbStatus(null)

    try {
      const response = await fetch("/api/db-status")
      const data = await response.json()

      setDbStatus({
        connected: data.success,
        message: data.message,
      })

      if (data.success) {
        toast({
          title: "Success",
          description: "Database connection successful",
        })
      } else {
        toast({
          title: "Error",
          description: "Database connection failed",
          variant: "destructive",
        })
      }
    } catch (error) {
      setDbStatus({
        connected: false,
        message: error instanceof Error ? error.message : "An unexpected error occurred",
      })
      toast({
        title: "Error",
        description: "Failed to check database connection",
        variant: "destructive",
      })
    } finally {
      setIsCheckingConnection(false)
    }
  }

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-8">Database Setup</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Database Connection</CardTitle>
            <CardDescription>Check if the database is connected properly</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={checkDatabaseConnection}
              className="w-full"
              variant="outline"
              disabled={isCheckingConnection}
            >
              {isCheckingConnection ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking Connection...
                </>
              ) : (
                "Check Database Connection"
              )}
            </Button>

            {dbStatus && (
              <div
                className={`mt-4 p-3 rounded-md ${
                  dbStatus.connected ? "bg-green-500/10 text-green-500" : "bg-destructive/10 text-destructive"
                }`}
              >
                <div className="flex items-center">
                  {dbStatus.connected ? <CheckCircle className="h-5 w-5 mr-2" /> : <XCircle className="h-5 w-5 mr-2" />}
                  <span>{dbStatus.message}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Seed Database</CardTitle>
            <CardDescription>Populate the database with initial data</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              This will create sample users, skills, interests, business ideas, and resources to help you get started.
              <br />
              <br />
              <strong>Admin credentials:</strong> admin@bizmatchke.co.ke / admin123
              <br />
              <strong>User credentials:</strong> john@example.com / user123
            </p>

            <Button onClick={handleSeedDatabase} className="w-full" disabled={isSeeding}>
              {isSeeding ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Seeding Database...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  Seed Database
                </>
              )}
            </Button>

            {seedResult && (
              <div
                className={`mt-4 p-3 rounded-md ${
                  seedResult.success ? "bg-green-500/10 text-green-500" : "bg-destructive/10 text-destructive"
                }`}
              >
                <div className="flex items-center">
                  {seedResult.success ? <CheckCircle className="h-5 w-5 mr-2" /> : <XCircle className="h-5 w-5 mr-2" />}
                  <span>{seedResult.message}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
          <CardDescription>What to do after setting up your database</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2">
            <li>Check the database connection using the button above</li>
            <li>Seed the database with initial data</li>
            <li>
              Navigate to the{" "}
              <a href="/login" className="text-primary underline">
                login page
              </a>{" "}
              and sign in with the provided credentials
            </li>
            <li>
              Explore the{" "}
              <a href="/dashboard" className="text-primary underline">
                dashboard
              </a>{" "}
              to see the application in action
            </li>
            <li>
              Try the{" "}
              <a href="/dashboard/idea-generator" className="text-primary underline">
                idea generator
              </a>{" "}
              to test the Groq AI integration
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
