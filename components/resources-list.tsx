"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExternalLink, BookOpen, Video, FileText, Download, Loader2 } from "lucide-react"
import Link from "next/link"
import { getResources } from "@/app/actions/resources"
import { motion } from "framer-motion"
import type { JSX } from "react/jsx-runtime"

interface Resource {
  id: string | number
  title: string
  description: string
  type: "article" | "video" | "guide" | "template"
  url: string
  created_at: string
}

export default function ResourcesList() {
  const [resources, setResources] = useState<Resource[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchResources = async () => {
      setIsLoading(true)
      try {
        const result = await getResources()
        if (result.success) {
          setResources(result.resources || [])
        } else {
          setError(result.message || "Failed to load resources")
        }
      } catch (err) {
        setError("An error occurred while fetching resources")
      } finally {
        setIsLoading(false)
      }
    }

    fetchResources()
  }, [])

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "article":
        return <BookOpen className="h-5 w-5" />
      case "video":
        return <Video className="h-5 w-5" />
      case "guide":
        return <FileText className="h-5 w-5" />
      case "template":
        return <Download className="h-5 w-5" />
      default:
        return <BookOpen className="h-5 w-5" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-destructive/10 text-destructive p-4 rounded-md">
        <p>{error}</p>
      </div>
    )
  }

  if (resources.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No resources found.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="all">All Resources</TabsTrigger>
          <TabsTrigger value="article">Articles</TabsTrigger>
          <TabsTrigger value="video">Videos</TabsTrigger>
          <TabsTrigger value="guide">Guides</TabsTrigger>
          <TabsTrigger value="template">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((resource, index) => (
              <ResourceCard key={resource.id} resource={resource} index={index} getResourceIcon={getResourceIcon} />
            ))}
          </div>
        </TabsContent>

        {["article", "video", "guide", "template"].map((type) => (
          <TabsContent key={type} value={type} className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources
                .filter((resource) => resource.type === type)
                .map((resource, index) => (
                  <ResourceCard key={resource.id} resource={resource} index={index} getResourceIcon={getResourceIcon} />
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

interface ResourceCardProps {
  resource: Resource
  index: number
  getResourceIcon: (type: string) => JSX.Element
}

function ResourceCard({ resource, index, getResourceIcon }: ResourceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="h-full border-0 shadow-md hover:shadow-lg transition-shadow bg-card">
        <CardHeader className="pb-2">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mb-2">
            {getResourceIcon(resource.type)}
          </div>
          <CardTitle className="text-lg">{resource.title}</CardTitle>
          <CardDescription>{resource.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{new Date(resource.created_at).toLocaleDateString()}</span>
            <Button variant="outline" size="sm" asChild>
              <Link href={resource.url} target="_blank" className="flex items-center gap-1">
                <span>View</span>
                <ExternalLink className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
