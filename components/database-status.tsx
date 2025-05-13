"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CheckCircle, XCircle, Database } from "lucide-react"

export function DatabaseStatus() {
  const [status, setStatus] = useState<"loading" | "connected" | "error">("loading")
  const [message, setMessage] = useState("")
  const [stats, setStats] = useState<{ users: number; resources: number; ideas: number } | null>(null)

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch("/api/db-status")
        const data = await response.json()

        if (data.success) {
          setStatus("connected")
          setMessage(data.message)
          if (data.stats) {
            setStats(data.stats)
          }
        } else {
          setStatus("error")
          setMessage(data.message)
        }
      } catch (error) {
        setStatus("error")
        setMessage("Failed to connect to database")
      }
    }

    checkStatus()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Status
        </CardTitle>
        <CardDescription>Connection to Neon Postgres database</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-4">
          {status === "loading" && (
            <>
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              <span>Checking connection...</span>
            </>
          )}

          {status === "connected" && (
            <>
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-green-500 font-medium">Connected</span>
            </>
          )}

          {status === "error" && (
            <>
              <XCircle className="h-5 w-5 text-destructive" />
              <span className="text-destructive font-medium">Connection Error</span>
            </>
          )}
        </div>

        {message && <p className="text-sm text-muted-foreground mb-4">{message}</p>}

        {stats && status === "connected" && (
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="flex flex-col items-center p-2 bg-muted rounded-md">
              <span className="text-sm text-muted-foreground">Users</span>
              <span className="text-2xl font-bold">{stats.users}</span>
            </div>
            <div className="flex flex-col items-center p-2 bg-muted rounded-md">
              <span className="text-sm text-muted-foreground">Resources</span>
              <span className="text-2xl font-bold">{stats.resources}</span>
            </div>
            <div className="flex flex-col items-center p-2 bg-muted rounded-md">
              <span className="text-sm text-muted-foreground">Ideas</span>
              <span className="text-2xl font-bold">{stats.ideas}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
