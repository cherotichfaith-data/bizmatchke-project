"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getDashboardStats } from "@/app/actions/admin"
import { useAuth } from "@/contexts/auth-context"
import { Loader2, Users, Lightbulb, Bookmark, Activity } from "lucide-react"
import Link from "next/link"

export default function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true)
      try {
        const result = await getDashboardStats()
        if (result.success) {
          setStats(result.stats)
        } else {
          setError(result.message || "Failed to load dashboard statistics")
        }
      } catch (err) {
        setError("An error occurred while fetching dashboard statistics")
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (isLoading) {
    return (
      <div className="container py-12 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-12">
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-12">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Welcome, {user?.name}. Manage your application here.</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-4">
          <Button asChild variant="outline">
            <Link href="/admin/users">Manage Users</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/resources">Manage Resources</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-0 shadow-md bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <h3 className="text-3xl font-bold">{stats.totalUsers}</h3>
                <p className="text-sm text-muted-foreground mt-1">+{stats.newUsers} this week</p>
              </div>
              <div className="bg-primary/20 p-3 rounded-full">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Ideas</p>
                <h3 className="text-3xl font-bold">{stats.totalIdeas}</h3>
                <p className="text-sm text-muted-foreground mt-1">+{stats.newIdeas} this week</p>
              </div>
              <div className="bg-primary/20 p-3 rounded-full">
                <Lightbulb className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Saved Ideas</p>
                <h3 className="text-3xl font-bold">{stats.savedIdeas}</h3>
                <p className="text-sm text-muted-foreground mt-1">&nbsp;</p>
              </div>
              <div className="bg-primary/20 p-3 rounded-full">
                <Bookmark className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <h3 className="text-3xl font-bold">{stats.activeUsers}</h3>
                <p className="text-sm text-muted-foreground mt-1">Last 7 days</p>
              </div>
              <div className="bg-primary/20 p-3 rounded-full">
                <Activity className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="activity" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="users">New Users</TabsTrigger>
          <TabsTrigger value="ideas">New Ideas</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="mt-0">
          <Card className="border-0 shadow-md bg-card">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest actions across the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentActivity.map((activity: any) => (
                  <div key={activity.id} className="flex items-start gap-4 pb-4 border-b border-border last:border-0">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Activity className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{activity.user_name}</p>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(activity.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="mt-0">
          <Card className="border-0 shadow-md bg-card">
            <CardHeader>
              <CardTitle>New Users</CardTitle>
              <CardDescription>Users who joined in the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {stats.newUsers} new users joined in the last 7 days. View all users for more details.
              </p>
              <Button asChild className="mt-4">
                <Link href="/admin/users">View All Users</Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ideas" className="mt-0">
          <Card className="border-0 shadow-md bg-card">
            <CardHeader>
              <CardTitle>New Ideas</CardTitle>
              <CardDescription>Business ideas generated in the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {stats.newIdeas} new business ideas were generated in the last 7 days.
              </p>
              <Button asChild className="mt-4">
                <Link href="/admin/ideas">View All Ideas</Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
