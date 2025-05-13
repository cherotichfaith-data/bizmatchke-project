"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { seedDatabase } from "@/app/actions/seed-database"
import { Loader2, Database, Users, BookOpen, Lightbulb } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export default function DatabaseAdmin() {
  const [isSeeding, setIsSeeding] = useState(false)
  const [seedMessage, setSeedMessage] = useState("")
  const [dbStats, setDbStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSeedDatabase = async () => {
    setIsSeeding(true)
    setSeedMessage("")

    try {
      const result = await seedDatabase()
      setSeedMessage(result.message)

      if (result.success) {
        toast({
          title: "Success",
          description: "Database seeded successfully",
        })
        // Refresh stats after seeding
        fetchDatabaseStats()
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      setSeedMessage("Error seeding database")
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSeeding(false)
    }
  }

  const fetchDatabaseStats = async () => {
    setIsLoading(true)
    try {
      // Fetch users count
      const usersResponse = await fetch("/api/admin/stats/users")
      const usersData = await usersResponse.json()

      // Fetch resources count
      const resourcesResponse = await fetch("/api/admin/stats/resources")
      const resourcesData = await resourcesResponse.json()

      // Fetch ideas count
      const ideasResponse = await fetch("/api/admin/stats/ideas")
      const ideasData = await ideasResponse.json()

      setDbStats({
        users: usersData.count || 0,
        resources: resourcesData.count || 0,
        ideas: ideasData.count || 0,
      })
    } catch (error) {
      console.error("Error fetching database stats:", error)
      toast({
        title: "Error",
        description: "Failed to fetch database statistics",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch stats on component mount
  useState(() => {
    fetchDatabaseStats()
  })

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-8">Database Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Database Status</CardTitle>
            <CardDescription>Current database status and statistics</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : dbStats ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <span>Users</span>
                  </div>
                  <span className="font-bold">{dbStats.users}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-primary" />
                    <span>Business Ideas</span>
                  </div>
                  <span className="font-bold">{dbStats.ideas}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <span>Resources</span>
                  </div>
                  <span className="font-bold">{dbStats.resources}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">No database statistics available</div>
            )}

            <Button onClick={fetchDatabaseStats} variant="outline" className="mt-4 w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Refreshing...
                </>
              ) : (
                "Refresh Statistics"
              )}
            </Button>
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
              Admin credentials: admin@bizmatchke.co.ke / admin123 User credentials: john@example.com / user123
            </p>

            <Button
              onClick={handleSeedDatabase}
              className="w-full bg-primary text-primary-foreground"
              disabled={isSeeding}
            >
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

            {seedMessage && (
              <div
                className={`mt-4 p-3 rounded-md ${seedMessage.includes("Error") ? "bg-destructive/10 text-destructive" : "bg-green-500/10 text-green-500"}`}
              >
                {seedMessage}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users">
        <TabsList className="mb-4">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="ideas">Business Ideas</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Users Management</CardTitle>
              <CardDescription>View and manage users in the database</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This section will display users from the database. Seed the database first to see data here.
              </p>
              {/* User table would go here in a full implementation */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ideas">
          <Card>
            <CardHeader>
              <CardTitle>Business Ideas</CardTitle>
              <CardDescription>View and manage business ideas in the database</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This section will display business ideas from the database. Seed the database first to see data here.
              </p>
              {/* Ideas table would go here in a full implementation */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources">
          <Card>
            <CardHeader>
              <CardTitle>Resources</CardTitle>
              <CardDescription>View and manage resources in the database</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This section will display resources from the database. Seed the database first to see data here.
              </p>
              {/* Resources table would go here in a full implementation */}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
