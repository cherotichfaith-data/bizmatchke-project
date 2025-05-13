"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import {
  Wand2Icon,
  BookmarkIcon,
  Share2,
  AlertCircle,
  Target,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  BarChart,
  PieChart,
  Percent,
} from "lucide-react"
import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { Badge } from "@/components/ui/badge"
import { generateBusinessIdeas, saveBusinessIdea } from "@/app/actions/business-ideas"
import { toast } from "@/components/ui/use-toast"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface BusinessIdea {
  id: string | number
  title: string
  budget_range: string
  skills: string[]
  interests: string[]
  description: string
  location?: string
  potential_challenges?: string[]
  success_factors?: string[]
  target_market?: string
  // New fields
  market_trends?: string[]
  success_rate_estimate?: string
  estimated_roi?: string
  economic_data?: {
    growth_potential: string
    market_saturation: string
    competition_level: string
  }
}

export default function IdeaGenerator() {
  const [skills, setSkills] = useState<string[]>([])
  const [newSkill, setNewSkill] = useState("")
  const [budget, setBudget] = useState("")
  const [location, setLocation] = useState("")
  const [interests, setInterests] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [ideas, setIdeas] = useState<BusinessIdea[]>([])
  const [showResults, setShowResults] = useState(false)
  const [savedIdeas, setSavedIdeas] = useState<string[]>([])
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [currentIdea, setCurrentIdea] = useState<BusinessIdea | null>(null)
  const [saveNotes, setSaveNotes] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const interestOptions = [
    { id: "tech", label: "Technology" },
    { id: "agriculture", label: "Agriculture" },
    { id: "food", label: "Food & Beverage" },
    { id: "fashion", label: "Fashion" },
    { id: "services", label: "Services" },
    { id: "retail", label: "Retail" },
    { id: "education", label: "Education" },
    { id: "health", label: "Healthcare" },
    { id: "transport", label: "Transportation" },
    { id: "entertainment", label: "Entertainment" },
  ]

  const skillOptions = [
    "Programming",
    "Design",
    "Marketing",
    "Sales",
    "Writing",
    "Teaching",
    "Cooking",
    "Farming",
    "Accounting",
    "Management",
    "Customer Service",
  ]

  const handleInterestChange = (id: string, checked: boolean) => {
    if (checked) {
      setInterests([...interests, id])
    } else {
      setInterests(interests.filter((item) => item !== id))
    }
  }

  const addSkill = () => {
    if (newSkill && !skills.includes(newSkill)) {
      setSkills([...skills, newSkill])
      setNewSkill("")
    }
  }

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const formData = new FormData()

      // Add skills to form data
      skills.forEach((skill) => {
        formData.append("skills", skill)
      })

      // Add interests to form data
      interests.forEach((interest) => {
        formData.append("interests", interest)
      })

      formData.append("budget", budget)
      formData.append("location", location)

      const result = await generateBusinessIdeas(formData)

      if (result.success) {
        setIdeas(result.ideas)
        setShowResults(true)
        toast({
          title: "Success",
          description: "AI-powered business ideas generated successfully!",
        })
      } else {
        setError(result.message || "Failed to generate ideas")
        toast({
          title: "Error",
          description: result.message || "Failed to generate ideas",
          variant: "destructive",
        })
      }
    } catch (err) {
      setError("An error occurred while generating ideas")
      toast({
        title: "Error",
        description: "An error occurred while generating ideas",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveClick = (idea: BusinessIdea) => {
    setCurrentIdea(idea)
    setSaveNotes("")
    setSaveDialogOpen(true)
  }

  const handleSaveIdea = async () => {
    if (!currentIdea) return

    setIsSaving(true)

    try {
      const result = await saveBusinessIdea(Number(currentIdea.id), saveNotes)

      if (result.success) {
        setSavedIdeas([...savedIdeas, String(currentIdea.id)])
        toast({
          title: "Success",
          description: "Business idea saved successfully!",
        })
        setSaveDialogOpen(false)
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to save idea",
          variant: "destructive",
        })
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "An error occurred while saving the idea",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const shareIdea = (idea: BusinessIdea) => {
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

  return (
    <div className="container py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">Generate Business Ideas</h1>
        <p className="text-muted-foreground">Tell us about yourself to get AI-powered business recommendations</p>
      </motion.div>

      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="max-w-4xl mx-auto shadow-lg border-0 bg-card">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div
                className="space-y-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Label htmlFor="skills">Your Skills</Label>
                <div className="flex gap-2 mb-2">
                  <Select value={newSkill} onValueChange={setNewSkill}>
                    <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-primary/50 bg-muted">
                      <SelectValue placeholder="Select a skill" />
                    </SelectTrigger>
                    <SelectContent>
                      {skillOptions.map((skill) => (
                        <SelectItem key={skill} value={skill}>
                          {skill}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="button" variant="outline" onClick={addSkill} disabled={!newSkill}>
                    Add
                  </Button>
                </div>

                <Input
                  id="custom-skill"
                  placeholder="Or type a custom skill and press Enter"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addSkill()
                    }
                  }}
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/50 bg-muted"
                />

                <div className="flex flex-wrap gap-2 mt-2">
                  {skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-1 rounded-full hover:bg-primary/20 p-1"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </motion.div>

              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="space-y-2">
                  <Label htmlFor="budget">Budget (KES)</Label>
                  <Select value={budget} onValueChange={setBudget} required>
                    <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-primary/50 bg-muted">
                      <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-10000">0 - 10,000</SelectItem>
                      <SelectItem value="10000-50000">10K - 50K</SelectItem>
                      <SelectItem value="50000-100000">50K - 100K</SelectItem>
                      <SelectItem value="100000+">100K+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Select value={location} onValueChange={setLocation} required>
                    <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-primary/50 bg-muted">
                      <SelectValue placeholder="Select county" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Nairobi">Nairobi</SelectItem>
                      <SelectItem value="Mombasa">Mombasa</SelectItem>
                      <SelectItem value="Kisumu">Kisumu</SelectItem>
                      <SelectItem value="Nakuru">Nakuru</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </motion.div>

              <motion.div
                className="space-y-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Label>Interests</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {interestOptions.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={option.id}
                        checked={interests.includes(option.id)}
                        onCheckedChange={(checked) => handleInterestChange(option.id, checked as boolean)}
                        className="transition-all duration-200 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <label
                        htmlFor={option.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-card-foreground"
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </motion.div>

              {error && (
                <div className="bg-destructive/10 text-destructive p-4 rounded-md flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  className="w-full transition-all duration-300 bg-primary text-background"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-background"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Generating AI Ideas...
                    </>
                  ) : (
                    <>
                      <Wand2Icon className="mr-2 h-5 w-5" />
                      Generate Business Ideas
                    </>
                  )}
                </Button>
              </motion.div>
            </form>

            {showResults && (
              <motion.div
                className="mt-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h3 className="text-xl font-semibold mb-6 text-center text-card-foreground">
                  Your AI-Generated Business Ideas
                </h3>
                <div className="space-y-8">
                  {ideas.map((idea, index) => (
                    <motion.div
                      key={idea.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.2, duration: 0.5 }}
                      whileHover={{
                        scale: 1.02,
                        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)",
                      }}
                      className="p-6 border-l-4 border-primary rounded-lg bg-primary/10 relative"
                    >
                      <h4 className="text-xl font-semibold mb-2 text-card-foreground pr-16">{idea.title}</h4>
                      <p className="text-muted-foreground mb-4">{idea.description}</p>

                      <Accordion type="single" collapsible className="w-full">
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
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>

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

                      <div className="absolute top-4 right-4 flex space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleSaveClick(idea)}
                          className={`${
                            savedIdeas.includes(String(idea.id))
                              ? "text-primary"
                              : "text-muted-foreground hover:text-primary"
                          }`}
                        >
                          <BookmarkIcon className="h-5 w-5" />
                          <span className="sr-only">
                            {savedIdeas.includes(String(idea.id)) ? "Saved" : "Save idea"}
                          </span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => shareIdea(idea)}
                          className="text-muted-foreground hover:text-primary"
                        >
                          <Share2 className="h-5 w-5" />
                          <span className="sr-only">Share idea</span>
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Save Business Idea</DialogTitle>
            <DialogDescription>Add notes to this business idea before saving it to your collection.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add your thoughts or notes about this idea..."
                value={saveNotes}
                onChange={(e) => setSaveNotes(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSaveIdea} disabled={isSaving}>
              {isSaving ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Saving...
                </>
              ) : (
                "Save Idea"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
