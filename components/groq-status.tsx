"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CheckCircle, XCircle } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export function GroqStatus() {
  const [status, setStatus] = useState<{ connected: boolean; message: string; response?: string } | null>(null)
  const [isChecking, setIsChecking] = useState(false)

  const checkGroqConnection = async () => {
    setIsChecking(true)
    setStatus(null)

    try {
      const response = await fetch("/api/groq-test")
      const data = await response.json()

      setStatus({
        connected: data.success,
        message: data.message,
        response: data.response,
      })

      if (data.success) {
        toast({
          title: "Success",
          description: "Groq API connection successful",
        })
      } else {
        toast({
          title: "Error",
          description: "Groq API connection failed",
          variant: "destructive",
        })
      }
    } catch (error) {
      setStatus({
        connected: false,
        message: error instanceof Error ? error.message : "An unexpected error occurred",
      })
      toast({
        title: "Error",
        description: "Failed to check Groq API connection",
        variant: "destructive",
      })
    } finally {
      setIsChecking(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Groq AI Status</CardTitle>
        <CardDescription>Check if the Groq AI API is connected properly</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={checkGroqConnection} className="w-full" variant="outline" disabled={isChecking}>
          {isChecking ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Checking Groq Connection...
            </>
          ) : (
            "Check Groq AI Connection"
          )}
        </Button>

        {status && (
          <div
            className={`mt-4 p-3 rounded-md ${
              status.connected ? "bg-green-500/10 text-green-500" : "bg-destructive/10 text-destructive"
            }`}
          >
            <div className="flex items-center">
              {status.connected ? <CheckCircle className="h-5 w-5 mr-2" /> : <XCircle className="h-5 w-5 mr-2" />}
              <span>{status.message}</span>
            </div>
            {status.response && (
              <div className="mt-2 text-sm">
                <strong>Response:</strong> {status.response}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
