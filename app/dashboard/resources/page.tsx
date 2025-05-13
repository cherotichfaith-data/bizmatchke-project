"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { ExternalLink, BookOpen, Video, FileText, Download } from "lucide-react"
import Link from "next/link"
import type { JSX } from "react"

interface Resource {
  id: string
  title: string
  description: string
  type: "article" | "video" | "guide" | "template"
  url: string
  date: string
}

export default function Resources() {
  const [resources] = useState<Resource[]>([
    {
      id: "1",
      title: "Starting a Business in Kenya: Legal Requirements",
      description: "A comprehensive guide to the legal requirements for starting a business in Kenya.",
      type: "article",
      url: "#",
      date: "2023-03-15",
    },
    {
      id: "2",
      title: "How to Create a Business Plan",
      description: "Step-by-step guide to creating a compelling business plan for your new venture.",
      type: "guide",
      url: "#",
      date: "2023-02-20",
    },
    {
      id: "3",
      title: "Funding Options for Kenyan Entrepreneurs",
      description: "Explore various funding options available to entrepreneurs in Kenya.",
      type: "article",
      url: "#",
      date: "2023-04-05",
    },
    {
      id: "4",
      title: "Marketing Strategies for Small Businesses",
      description: "Effective marketing strategies for small businesses with limited budgets.",
      type: "video",
      url: "#",
      date: "2023-03-28",
    },
    {
      id: "5",
      title: "Financial Projection Template",
      description: "Excel template for creating financial projections for your business.",
      type: "template",
      url: "#",
      date: "2023-01-10",
    },
    {
      id: "6",
      title: "Business Registration Process in Kenya",
      description: "Video tutorial on how to register your business in Kenya.",
      type: "video",
      url: "#",
      date: "2023-02-15",
    },
  ])

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

  return (
    <div className="container py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">Resources</h1>
        <p className="text-muted-foreground">Helpful resources to support your entrepreneurial journey</p>
      </motion.div>

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
            <span className="text-xs text-muted-foreground">{new Date(resource.date).toLocaleDateString()}</span>
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
