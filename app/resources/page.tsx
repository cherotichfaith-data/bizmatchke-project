import ResourcesList from "@/components/resources-list"

export default function ResourcesPage() {
  return (
    <div className="container py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Resources</h1>
        <p className="text-muted-foreground">Helpful resources to support your entrepreneurial journey</p>
      </div>

      <ResourcesList />
    </div>
  )
}
