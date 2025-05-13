import { DatabaseStatus } from "@/components/database-status"
import { GroqStatus } from "@/components/groq-status"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestPage() {
  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-8">Integration Tests</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DatabaseStatus />
        <GroqStatus />
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
            <CardDescription>What to do after testing your integrations</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2">
              <li>
                If both integrations are working, proceed to{" "}
                <a href="/db-seed" className="text-primary underline">
                  seed your database
                </a>
              </li>
              <li>
                If there are issues with the database connection, check your Neon database configuration in the Vercel
                dashboard
              </li>
              <li>If there are issues with the Groq API, check your Groq API key in the Vercel dashboard</li>
              <li>
                After seeding the database, you can{" "}
                <a href="/login" className="text-primary underline">
                  log in
                </a>{" "}
                with the provided credentials
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
