"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"

export default function DatabaseStatus() {
  const [status, setStatus] = useState<"loading" | "connected" | "error">("loading")
  const [message, setMessage] = useState<string>("")

  useEffect(() => {
    const checkDatabaseStatus = async () => {
      try {
        const response = await fetch("/api/db-status")
        const data = await response.json()

        if (data.success) {
          setStatus("connected")
          setMessage(data.message)
        } else {
          setStatus("error")
          setMessage(data.message)
        }
      } catch (error) {
        setStatus("error")
        setMessage("Failed to check database status")
      }
    }

    checkDatabaseStatus()
  }, [])

  return (
    <div className="flex items-center gap-2">
      {status === "loading" && (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Checking database...</span>
        </>
      )}

      {status === "connected" && (
        <Badge variant="outline" className="bg-green-500/10 text-green-500 hover:bg-green-500/20">
          Database Connected
        </Badge>
      )}

      {status === "error" && (
        <Badge variant="outline" className="bg-destructive/10 text-destructive hover:bg-destructive/20">
          Database Error
        </Badge>
      )}
    </div>
  )
}
