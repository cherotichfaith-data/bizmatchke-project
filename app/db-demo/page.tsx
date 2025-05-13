"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { seedInitialData } from "@/app/actions/seed-data"
import {
  testDatabaseConnection,
  getUsersCount,
  getResourcesCount,
  getSkillsAndInterests,
} from "@/app/actions/db-operations"
import { Loader2, CheckCircle, XCircle } from "lucide-react"

export default function DatabaseDemo() {
  const [dbStatus, setDbStatus] = useState<"loading" | "connected" | "error">("loading")
  const [message, setMessage] = useState("")
  const [isSeeding, setIsSeeding] = useState(false)
  const [seedMessage, setSeedMessage] = useState("")
  const [usersCount, setUsersCount] = useState<number | null>(null)
  const [resourcesCount, setResourcesCount] = useState<number | null>(null)
  const [skills, setSkills] = useState<string[]>([])
  const [interests, setInterests] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkDatabase = async () => {
      try {
        const result = await testDatabaseConnection()
        if (result.success) {
          setDbStatus("connected")
          setMessage(result.message)

          // Load counts
          loadCounts()
        } else {
          setDbStatus("error")
          setMessage(result.message)
        }
      } catch (error) {
        setDbStatus("error")
        setMessage("Failed to connect to database")
      } finally {
        setIsLoading(false)
      }
    }

    checkDatabase()
  }, [])

  const loadCounts = async () => {
    try {
      const usersResult = await getUsersCount()
      if (usersResult.success) {
        setUsersCount(usersResult.count)
      }

      const resourcesResult = await getResourcesCount()
      if (resourcesResult.success) {
        setResourcesCount(resourcesResult.count)
      }

      const skillsInterestsResult = await getSkillsAndInterests()
      if (skillsInterestsResult.success) {
        setSkills(skillsInterestsResult.skills)
        setInterests(skillsInterestsResult.interests)
      }
    } catch (error) {
      console.error("Error loading counts:", error)
    }
  }

  const handleSeedData = async () => {
    setIsSeeding(true)
    setSeedMessage("")

    try {
      const result = await seedInitialData()
      setSeedMessage(result.message)

      if (result.success) {
        // Reload counts
        loadCounts()
      }
    } catch (error) {
      setSeedMessage("Error seeding data")
    } finally {
      setIsSeeding(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container py-12 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-8">BizMatchKE Database Demo</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Database Status</CardTitle>
            <CardDescription>Connection to Neon Postgres database</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {dbStatus === "loading" && (
                <>
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  <span>Checking connection...</span>
                </>
              )}

              {dbStatus === "connected" && (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-green-500 font-medium">Connected</span>
                </>
              )}

              {dbStatus === "error" && (
                <>
                  <XCircle className="h-5 w-5 text-destructive" />
                  <span className="text-destructive font-medium">Connection Error</span>
                </>
              )}
            </div>

            {message && <p className="mt-2 text-sm text-muted-foreground">{message}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Seed Database</CardTitle>
            <CardDescription>Add initial data to the database</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleSeedData} disabled={isSeeding || dbStatus !== "connected"} className="w-full">
              {isSeeding ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Seeding Data...
                </>
              ) : (
                "Seed Initial Data"
              )}
            </Button>

            {seedMessage && <p className="mt-2 text-sm text-muted-foreground">{seedMessage}</p>}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="counts">
        <TabsList className="mb-4">
          <TabsTrigger value="counts">Database Counts</TabsTrigger>
          <TabsTrigger value="skills">Skills & Interests</TabsTrigger>
        </TabsList>

        <TabsContent value="counts">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Users</CardTitle>
                <CardDescription>Total users in the database</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{usersCount !== null ? usersCount : "-"}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resources</CardTitle>
                <CardDescription>Total resources in the database</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{resourcesCount !== null ? resourcesCount : "-"}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="skills">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Skills</CardTitle>
                <CardDescription>Available skills in the database</CardDescription>
              </CardHeader>
              <CardContent>
                {skills.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-1">
                    {skills.map((skill, index) => (
                      <li key={index}>{skill}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">No skills found</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Interests</CardTitle>
                <CardDescription>Available interests in the database</CardDescription>
              </CardHeader>
              <CardContent>
                {interests.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-1">
                    {interests.map((interest, index) => (
                      <li key={index}>{interest}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">No interests found</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
