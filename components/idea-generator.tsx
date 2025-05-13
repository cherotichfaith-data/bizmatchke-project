"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Wand2Icon } from "lucide-react"
import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"

interface BusinessIdea {
  title: string
  budget: string
  skills: string
  interests: string
}

export default function IdeaGenerator() {
  const [skills, setSkills] = useState("")
  const [budget, setBudget] = useState("")
  const [location, setLocation] = useState("")
  const [interests, setInterests] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [ideas, setIdeas] = useState<BusinessIdea[]>([])
  const [showResults, setShowResults] = useState(false)

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
  ]

  const handleInterestChange = (id: string, checked: boolean) => {
    if (checked) {
      setInterests([...interests, id])
    } else {
      setInterests(interests.filter((item) => item !== id))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      const businessTypes = [
        "Mobile App Development",
        "Organic Farming",
        "Eco-Friendly Products",
        "Digital Marketing Agency",
        "Specialized Catering",
        "Handmade Crafts",
        "Recycling Service",
        "Online Education",
        "Tour Guide Service",
        "Custom Clothing",
      ]

      const generatedIdeas = Array(3)
        .fill(null)
        .map(() => {
          const randomType = businessTypes[Math.floor(Math.random() * businessTypes.length)]
          return {
            title: `${randomType} Business ${location ? "in " + location : ""}`,
            budget: getBudgetRange(budget),
            skills: skills || "your skills",
            interests: interests.length
              ? interestOptions
                  .filter((option) => interests.includes(option.id))
                  .map((option) => option.label)
                  .join(", ")
              : "Various",
          }
        })

      setIdeas(generatedIdeas)
      setShowResults(true)
      setIsLoading(false)
    }, 1500)
  }

  const getBudgetRange = (budget: string) => {
    switch (budget) {
      case "0-10000":
        return "5,000 - 10,000 KES"
      case "10000-50000":
        return "15,000 - 40,000 KES"
      case "50000-100000":
        return "60,000 - 90,000 KES"
      case "100000+":
        return "100,000+ KES"
      default:
        return "various"
    }
  }

  return (
    <section id="idea-generator" className="py-20">
      <div className="container">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="max-w-4xl mx-auto shadow-lg border-0 bg-card">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2 text-card-foreground">Find Your Perfect Business</h2>
                <p className="text-muted-foreground">Complete your profile to get started</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <Label htmlFor="skills">Your Skills</Label>
                  <Input
                    id="skills"
                    placeholder="e.g. cooking, programming, farming"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    required
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary/50 bg-muted"
                  />
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
                        Generating...
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
                    Your Custom Business Ideas
                  </h3>
                  <div className="space-y-4">
                    {ideas.map((idea, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.2, duration: 0.5 }}
                        whileHover={{
                          scale: 1.02,
                          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)",
                        }}
                        className="p-6 border-l-4 border-primary rounded-lg bg-primary/10"
                      >
                        <h4 className="text-lg font-semibold mb-2 text-card-foreground">{idea.title}</h4>
                        <p className="text-muted-foreground mb-1">Start with {idea.budget}</p>
                        <p className="text-muted-foreground mb-1">Great for someone with {idea.skills}</p>
                        <div className="mt-2">
                          <span className="inline-block bg-primary/20 text-primary text-xs px-2 py-1 rounded">
                            {idea.interests} interests
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
