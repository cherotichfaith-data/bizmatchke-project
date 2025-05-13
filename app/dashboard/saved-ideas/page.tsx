"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, FileText, Pencil, Share2, Loader2, Bookmark, Calculator } from "lucide-react"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { getSavedIdeas, removeSavedIdea } from "@/app/actions/business-ideas"
import Link from "next/link"
import { toast } from "@/components/ui/use-toast"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

// Add new imports for the icons
import { Target, DollarSign, AlertTriangle, CheckCircle, TrendingUp, BarChart, PieChart, Percent } from "lucide-react"

// Update the SavedIdea interface to include the new fields
interface SavedIdea {
  id: number
  business_idea_id: number
  title: string
  description: string
  budget_range: string
  location: string
  created_at: string
  saved_at: string
  notes: string | null
  skills: string[]
  interests: string[]
  // New fields
  potential_challenges?: string[]
  success_factors?: string[]
  target_market?: string
  market_trends?: string[]
  success_rate_estimate?: string
  estimated_roi?: string
  economic_data?: {
    growth_potential: string
    market_saturation: string
    competition_level: string
  }
  has_financial_projection?: boolean
}

export default function SavedIdeas() {
  const [savedIdeas, setSavedIdeas] = useState<SavedIdea[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingIdea, setEditingIdea] = useState<SavedIdea | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isRemoving, setIsRemoving] = useState<string | null>(null)

  // Fetch saved ideas from the database
  useEffect(() => {
    const fetchSavedIdeas = async () => {
      setIsLoading(true)
      try {
        const result = await getSavedIdeas()
        if (result.success) {
          setSavedIdeas(result.savedIdeas || [])
        } else {
          setError(result.message || "Failed to load saved ideas")
          toast({
            title: "Error",
            description: result.message || "Failed to load saved ideas",
            variant: "destructive",
          })
        }
      } catch (err) {
        setError("An error occurred while fetching saved ideas")
        toast({
          title: "Error",
          description: "An error occurred while fetching saved ideas",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchSavedIdeas()
  }, [])

  const handleRemoveIdea = async (id: string | number) => {
    setIsRemoving(String(id))
    try {
      const result = await removeSavedIdea(Number(id))
      if (result.success) {
        setSavedIdeas(savedIdeas.filter((idea) => idea.id !== id))
        toast({
          title: "Success",
          description: "Idea removed successfully",
        })
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to remove idea",
          variant: "destructive",
        })
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "An error occurred while removing the idea",
        variant: "destructive",
      })
    } finally {
      setIsRemoving(null)
    }
  }

  const handleEditIdea = (idea: SavedIdea) => {
    setEditingIdea({ ...idea })
    setIsDialogOpen(true)
  }

  const handleSaveEdit = () => {
    if (editingIdea) {
      // In a real app, this would save to the database
      setSavedIdeas(savedIdeas.map((idea) => (idea.id === editingIdea.id ? editingIdea : idea)))
      setIsDialogOpen(false)
      toast({
        title: "Success",
        description: "Idea updated successfully",
      })
    }
  }

  const exportToPDF = (idea: SavedIdea) => {
    // In a real app, this would generate a PDF
    toast({
      title: "Export to PDF",
      description: `Exporting "${idea.title}" to PDF...`,
    })
  }

  const shareIdea = (idea: SavedIdea) => {
    // In a real app, this would open a share dialog
    if (navigator.share) {
      navigator
        .share({
          title: idea.title,
          text: `Check out this business idea: ${idea.title} - ${idea.description}`,
          url: window.location.href,
        })
        .catch((err) => {
          console.log("Error sharing:", err)
        })
    } else {
      // Fallback for browsers that don't support the Web Share API
      toast({
        title: "Share",
        description: `${idea.title} - ${idea.description}`,
      })
    }
  }

  if (isLoading) {
    return (
      <div className="container py-12 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your saved ideas...</p>
        </div>
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">Saved Ideas</h1>
        <p className="text-muted-foreground">Your collection of saved business ideas</p>
      </motion.div>

      {savedIdeas.length > 0 ? (
        <div className="space-y-6">
          {savedIdeas.map((idea, index) => (
            <motion.div
              key={idea.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow bg-card">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-card-foreground">{idea.title}</h3>
                      <p className="text-muted-foreground mt-2 mb-3">{idea.description}</p>
                      <p className="text-sm text-muted-foreground mb-1">Budget: {idea.budget_range}</p>
                      {idea.location && <p className="text-sm text-muted-foreground mb-1">Location: {idea.location}</p>}

                      <div className="flex flex-wrap gap-2 mt-3">
                        <div className="text-sm text-muted-foreground mr-1">Skills:</div>
                        {idea.skills.map((skill, i) => (
                          <Badge key={i} variant="outline" className="bg-primary/10">
                            {skill}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex flex-wrap gap-2 mt-2">
                        <div className="text-sm text-muted-foreground mr-1">Interests:</div>
                        {idea.interests.map((interest, i) => (
                          <Badge key={i} variant="outline" className="bg-secondary/10">
                            {interest}
                          </Badge>
                        ))}
                      </div>

                      {idea.notes && (
                        <div className="mt-3 p-3 bg-muted/50 rounded-md">
                          <p className="text-sm text-muted-foreground">Notes: {idea.notes}</p>
                        </div>
                      )}

                      <p className="text-xs text-muted-foreground mt-3">
                        Saved on: {new Date(idea.saved_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex flex-wrap md:flex-col gap-2 self-end md:self-start">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                        onClick={() => handleEditIdea(idea)}
                      >
                        <Pencil className="h-4 w-4" />
                        <span>Edit</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                        onClick={() => exportToPDF(idea)}
                      >
                        <FileText className="h-4 w-4" />
                        <span>Export</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                        onClick={() => shareIdea(idea)}
                      >
                        <Share2 className="h-4 w-4" />
                        <span>Share</span>
                      </Button>
                      <Button asChild variant="outline" size="sm" className="flex items-center gap-1">
                        <Link href={`/dashboard/financial-projections/${idea.business_idea_id}`}>
                          <Calculator className="h-4 w-4" />
                          <span>Financials</span>
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive flex items-center gap-1"
                        onClick={() => handleRemoveIdea(idea.id)}
                        disabled={isRemoving === String(idea.id)}
                      >
                        {isRemoving === String(idea.id) ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                        <span>Remove</span>
                      </Button>
                    </div>
                  </div>
                  <Accordion type="single" collapsible className="w-full mt-4">
                    <AccordionItem value="details">
                      <AccordionTrigger className="text-sm font-medium">View Details</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 mt-2">
                          {idea.target_market && (
                            <div className="flex items-start gap-2">
                              <Target className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="font-medium text-sm">Target Market</p>
                                <p className="text-sm text-muted-foreground">{idea.target_market}</p>
                              </div>
                            </div>
                          )}

                          <div className="flex items-start gap-2">
                            <DollarSign className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-medium text-sm">Startup Costs</p>
                              <p className="text-sm text-muted-foreground">{idea.budget_range}</p>
                            </div>
                          </div>

                          {idea.potential_challenges && idea.potential_challenges.length > 0 && (
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="font-medium text-sm">Potential Challenges</p>
                                <ul className="list-disc pl-5 text-sm text-muted-foreground">
                                  {idea.potential_challenges.map((challenge, i) => (
                                    <li key={i}>{challenge}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}

                          {idea.success_factors && idea.success_factors.length > 0 && (
                            <div className="flex items-start gap-2">
                              <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="font-medium text-sm">Success Factors</p>
                                <ul className="list-disc pl-5 text-sm text-muted-foreground">
                                  {idea.success_factors.map((factor, i) => (
                                    <li key={i}>{factor}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}

                          {/* New sections for enhanced analysis */}
                          {idea.market_trends && idea.market_trends.length > 0 && (
                            <div className="flex items-start gap-2">
                              <TrendingUp className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="font-medium text-sm">Market Trends</p>
                                <ul className="list-disc pl-5 text-sm text-muted-foreground">
                                  {idea.market_trends.map((trend, i) => (
                                    <li key={i}>{trend}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}

                          {idea.success_rate_estimate && (
                            <div className="flex items-start gap-2">
                              <BarChart className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="font-medium text-sm">Success Rate Estimate</p>
                                <p className="text-sm text-muted-foreground">{idea.success_rate_estimate}</p>
                              </div>
                            </div>
                          )}

                          {idea.estimated_roi && (
                            <div className="flex items-start gap-2">
                              <Percent className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="font-medium text-sm">Estimated ROI</p>
                                <p className="text-sm text-muted-foreground">{idea.estimated_roi}</p>
                              </div>
                            </div>
                          )}

                          {idea.economic_data && (
                            <div className="flex items-start gap-2">
                              <PieChart className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="font-medium text-sm">Economic Data</p>
                                <div className="text-sm text-muted-foreground space-y-1 mt-1">
                                  <p>
                                    <span className="font-medium">Growth Potential:</span>{" "}
                                    {idea.economic_data.growth_potential}
                                  </p>
                                  <p>
                                    <span className="font-medium">Market Saturation:</span>{" "}
                                    {idea.economic_data.market_saturation}
                                  </p>
                                  <p>
                                    <span className="font-medium">Competition Level:</span>{" "}
                                    {idea.economic_data.competition_level}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {idea.has_financial_projection && (
                            <div className="mt-4 pt-4 border-t border-border">
                              <Button asChild variant="outline" size="sm" className="w-full">
                                <Link href={`/dashboard/financial-projections/${idea.business_idea_id}`}>
                                  <Calculator className="mr-2 h-4 w-4" />
                                  View Financial Projections
                                </Link>
                              </Button>
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center py-12"
        >
          <div className="bg-card p-8 rounded-lg shadow-md max-w-md mx-auto">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bookmark className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Saved Ideas Yet</h3>
            <p className="text-muted-foreground mb-6">
              You haven't saved any business ideas yet. Generate some ideas and save the ones you like!
            </p>
            <Button asChild className="bg-primary text-background">
              <Link href="/dashboard/idea-generator">Generate Ideas</Link>
            </Button>
          </div>
        </motion.div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Business Idea</DialogTitle>
            <DialogDescription>Make changes to your saved business idea.</DialogDescription>
          </DialogHeader>
          {editingIdea && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={editingIdea.title}
                  onChange={(e) => setEditingIdea({ ...editingIdea, title: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editingIdea.description}
                  onChange={(e) => setEditingIdea({ ...editingIdea, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={editingIdea.notes || ""}
                  onChange={(e) => setEditingIdea({ ...editingIdea, notes: e.target.value })}
                  rows={3}
                  placeholder="Add your personal notes about this idea..."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="budget">Budget</Label>
                <Input
                  id="budget"
                  value={editingIdea.budget_range}
                  onChange={(e) => setEditingIdea({ ...editingIdea, budget_range: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="skills">Skills (comma separated)</Label>
                <Input
                  id="skills"
                  value={editingIdea.skills.join(", ")}
                  onChange={(e) =>
                    setEditingIdea({
                      ...editingIdea,
                      skills: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="interests">Interests (comma separated)</Label>
                <Input
                  id="interests"
                  value={editingIdea.interests.join(", ")}
                  onChange={(e) =>
                    setEditingIdea({
                      ...editingIdea,
                      interests: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
