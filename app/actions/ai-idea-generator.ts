"use server"

import { groq } from "@ai-sdk/groq"
import { generateText } from "ai"

// Update the GeneratedIdea interface to include the new fields
export interface GeneratedIdea {
  title: string
  description: string
  skills_required: string[]
  target_market: string
  startup_costs: string
  potential_challenges: string[]
  success_factors: string[]
  // New fields for enhanced analysis
  market_trends: string[]
  success_rate_estimate: string
  estimated_roi: string
  economic_data: {
    growth_potential: string
    market_saturation: string
    competition_level: string
  }
}

// Add validation function to ensure the response has all required fields
function validateIdeaResponse(idea: any): boolean {
  return (
    idea &&
    typeof idea.title === "string" &&
    typeof idea.description === "string" &&
    Array.isArray(idea.skills_required) &&
    typeof idea.target_market === "string" &&
    typeof idea.startup_costs === "string" &&
    Array.isArray(idea.potential_challenges) &&
    Array.isArray(idea.success_factors)
  )
}

// Function to sanitize JSON text before parsing
function sanitizeJsonText(text: string): string {
  try {
    // Remove any text before the first '['
    const startIndex = text.indexOf("[")
    if (startIndex === -1) return text

    // Remove any text after the last ']'
    const endIndex = text.lastIndexOf("]")
    if (endIndex === -1) return text.substring(startIndex)

    let jsonText = text.substring(startIndex, endIndex + 1)

    // Fix common JSON syntax errors
    jsonText = jsonText
      // Fix missing colons after property names
      .replace(/("[\w\s]+")(\s*)([{[\w])/g, "$1:$2$3")
      // Fix property names without quotes
      .replace(/([{,]\s*)([a-zA-Z0-9_]+)(\s*:)/g, '$1"$2"$3')
      // Fix trailing commas in arrays
      .replace(/,(\s*[\]}])/g, "$1")
      // Fix missing commas between array elements
      .replace(/}(\s*){/g, "},$1{")
      // Fix unescaped quotes in strings
      .replace(/(:\s*"[^"]*)"([^"]*")/g, '$1\\"$2')
      // Fix missing quotes around string values
      .replace(/(:\s*)([a-zA-Z0-9_\s]+)(\s*[,}])/g, '$1"$2"$3')

    console.log("Sanitized JSON:", jsonText)
    return jsonText
  } catch (error) {
    console.error("Error during JSON sanitization:", error)
    return text
  }
}

// Function to completely rebuild the JSON structure if sanitization fails
function rebuildJson(text: string): string {
  try {
    // Extract business ideas using regex patterns
    const ideas = []

    // Look for title patterns
    const titleRegex = /"?title"?\s*:?\s*"([^"]+)"/gi
    const descRegex = /"?description"?\s*:?\s*"([^"]+)"/gi
    const skillsRegex = /"?skills_required"?\s*:?\s*\[(.*?)\]/gis
    const targetRegex = /"?target_market"?\s*:?\s*"([^"]+)"/gi
    const costsRegex = /"?startup_costs"?\s*:?\s*"([^"]+)"/gi

    let titleMatch
    let index = 0

    while ((titleMatch = titleRegex.exec(text)) !== null && index < 3) {
      // Find the corresponding description, skills, etc. near this title
      const searchStart = titleMatch.index
      const searchEnd = index < 2 ? titleRegex.lastIndex + 1000 : text.length
      const segment = text.substring(searchStart, searchEnd)

      // Extract data for this idea
      const title = titleMatch[1].trim()

      let description = ""
      const descMatch = segment.match(/"?description"?\s*:?\s*"([^"]+)"/i)
      if (descMatch) description = descMatch[1].trim()

      let skills = ["Business Management", "Marketing", "Communication"]
      const skillsMatch = segment.match(/"?skills_required"?\s*:?\s*\[(.*?)\]/is)
      if (skillsMatch) {
        const skillsText = skillsMatch[1]
        skills = skillsText
          .split(",")
          .map((s) => s.replace(/"/g, "").trim())
          .filter((s) => s.length > 0)
      }

      let target = "Local customers"
      const targetMatch = segment.match(/"?target_market"?\s*:?\s*"([^"]+)"/i)
      if (targetMatch) target = targetMatch[1].trim()

      let costs = "Varies based on scale"
      const costsMatch = segment.match(/"?startup_costs"?\s*:?\s*"([^"]+)"/i)
      if (costsMatch) costs = costsMatch[1].trim()

      // Create a structured idea object
      ideas.push({
        title,
        description,
        skills_required: skills,
        target_market: target,
        startup_costs: costs,
        potential_challenges: ["Market competition", "Initial customer acquisition"],
        success_factors: ["Quality service/product", "Effective marketing"],
        market_trends: ["Growing digital adoption", "Increasing focus on local businesses"],
        success_rate_estimate: "Medium - Based on similar business models in the region",
        estimated_roi: "25-35% within 12-18 months",
        economic_data: {
          growth_potential: "Medium - Steady growth expected",
          market_saturation: "Medium - Some competition exists",
          competition_level: "Medium - Differentiation is key",
        },
      })

      index++
    }

    // If we found at least one idea, return the JSON
    if (ideas.length > 0) {
      return JSON.stringify(ideas)
    }

    return text
  } catch (error) {
    console.error("Error during JSON rebuilding:", error)
    return text
  }
}

export async function generateAIBusinessIdeas(
  skills: string[],
  interests: string[],
  budget: string,
  location: string,
): Promise<GeneratedIdea[]> {
  try {
    // Format the budget range for better context
    let budgetRange = ""
    switch (budget) {
      case "0-10000":
        budgetRange = "5,000 - 10,000 KES (low budget)"
        break
      case "10000-50000":
        budgetRange = "10,000 - 50,000 KES (medium-low budget)"
        break
      case "50000-100000":
        budgetRange = "50,000 - 100,000 KES (medium budget)"
        break
      case "100000+":
        budgetRange = "100,000+ KES (higher budget)"
        break
      default:
        budgetRange = "various budget levels"
    }

    // Update the prompt to request the additional information with explicit JSON formatting instructions
    const prompt = `
You are a business consultant specializing in entrepreneurship in Kenya. 
Generate 3 unique, practical business ideas for an entrepreneur with the following profile:

Skills: ${skills.join(", ")}
Interests: ${interests.join(", ")}
Budget: ${budgetRange}
Location: ${location || "Kenya"}

For each business idea, provide:
1. A concise title (max 10 words)
2. A detailed description (2-3 sentences)
3. A list of 3-5 required skills
4. Target market description
5. Startup costs estimate in KES
6. 2-3 potential challenges
7. 2-3 success factors
8. 2-3 current market trends relevant to this business
9. Success rate estimate (Low/Medium/High with brief explanation)
10. Estimated ROI (Return on Investment) with timeframe
11. Economic data including growth potential, market saturation, and competition level

IMPORTANT: Your response MUST be a valid JSON array with exactly this format:
[
  {
    "title": "Business Title 1",
    "description": "Description text",
    "skills_required": ["Skill 1", "Skill 2", "Skill 3"],
    "target_market": "Target market description",
    "startup_costs": "Cost estimate in KES",
    "potential_challenges": ["Challenge 1", "Challenge 2"],
    "success_factors": ["Factor 1", "Factor 2"],
    "market_trends": ["Trend 1", "Trend 2"],
    "success_rate_estimate": "Medium - explanation here",
    "estimated_roi": "X% within Y months/years",
    "economic_data": {
      "growth_potential": "High - explanation",
      "market_saturation": "Low - explanation",
      "competition_level": "Medium - explanation"
    }
  }
]

CRITICAL: Ensure your JSON is valid. Every property name must be in double quotes and followed by a colon. Do not use single quotes, unescaped quotes within strings, or trailing commas. Do not include any text before or after the JSON array.
`

    // Call Groq API using AI SDK with reduced temperature for more structured output
    const { text } = await generateText({
      model: groq("llama3-70b-8192"),
      prompt: prompt,
      temperature: 0.5, // Reduced temperature for more predictable output
      maxTokens: 2000,
    })

    // Log the raw response for debugging
    console.log("Raw Groq response:", text)

    // Skip AI generation and use fallback ideas for testing if needed
    // return getFallbackIdeas(skills, interests, budget, location);

    // Enhanced JSON parsing with better error handling
    try {
      // First, try direct parsing
      const ideas: GeneratedIdea[] = JSON.parse(text)

      // Validate each idea
      const validIdeas = ideas.filter(validateIdeaResponse)

      if (validIdeas.length > 0) {
        return validIdeas.slice(0, 3)
      }

      throw new Error("No valid ideas found in the response")
    } catch (parseError) {
      console.error("Error parsing Groq response:", parseError)

      // Try to extract and sanitize JSON from the text
      try {
        // Try to find JSON array in the response
        const jsonMatch = text.match(/\[\s*\{.*\}\s*\]/s)
        if (jsonMatch) {
          const jsonText = jsonMatch[0]
          try {
            const ideas: GeneratedIdea[] = JSON.parse(jsonText)

            // Validate each idea
            const validIdeas = ideas.filter(validateIdeaResponse)

            if (validIdeas.length > 0) {
              return validIdeas.slice(0, 3)
            }
          } catch (innerParseError) {
            console.error("Error parsing extracted JSON:", innerParseError)
          }
        }

        // If direct extraction fails, try sanitizing the text
        const sanitizedText = sanitizeJsonText(text)
        try {
          const ideas: GeneratedIdea[] = JSON.parse(sanitizedText)

          // Validate each idea
          const validIdeas = ideas.filter(validateIdeaResponse)

          if (validIdeas.length > 0) {
            return validIdeas.slice(0, 3)
          }
        } catch (sanitizeError) {
          console.error("Error parsing sanitized JSON:", sanitizeError)

          // If sanitization fails, try rebuilding the JSON
          try {
            const rebuiltJson = rebuildJson(text)
            const ideas: GeneratedIdea[] = JSON.parse(rebuiltJson)

            // Validate each idea
            const validIdeas = ideas.filter(validateIdeaResponse)

            if (validIdeas.length > 0) {
              return validIdeas.slice(0, 3)
            }
          } catch (rebuildError) {
            console.error("Error rebuilding JSON:", rebuildError)
          }
        }

        // If all JSON parsing attempts fail, try to extract structured data manually
        return extractIdeasFromText(text, skills, interests, budget, location)
      } catch (extractError) {
        console.error("Error extracting data from response:", extractError)
        // Return fallback ideas if all parsing methods fail
        return getFallbackIdeas(skills, interests, budget, location)
      }
    }
  } catch (error) {
    console.error("Error generating ideas with Groq:", error)
    // Return fallback ideas if API call fails
    return getFallbackIdeas(skills, interests, budget, location)
  }
}

// Function to try extracting structured data from text response
function extractIdeasFromText(
  text: string,
  skills: string[],
  interests: string[],
  budget: string,
  location: string,
): GeneratedIdea[] {
  const ideas: GeneratedIdea[] = []

  // Look for patterns like "Title: Something" or "title": "Something"
  const titleMatches = text.match(/(?:"title"|Title)[\s:]*"?([^"]+)"?/gi)
  const descMatches = text.match(/(?:"description"|Description)[\s:]*"?([^"]+)"?/gi)

  // If we found at least some titles, try to construct ideas
  if (titleMatches && titleMatches.length > 0) {
    for (let i = 0; i < Math.min(titleMatches.length, 3); i++) {
      const titleMatch = titleMatches[i].match(/(?:"title"|Title)[\s:]*"?([^"]+)"?/i)
      const title = titleMatch ? titleMatch[1].trim() : `Business Idea ${i + 1}`

      let description = ""
      if (descMatches && descMatches[i]) {
        const descMatch = descMatches[i].match(/(?:"description"|Description)[\s:]*"?([^"]+)"?/i)
        description = descMatch ? descMatch[1].trim() : ""
      }

      ideas.push({
        title: title,
        description:
          description || `A business idea related to ${interests[0] || "local needs"} in ${location || "Kenya"}.`,
        skills_required: skills.length > 0 ? skills.slice(0, 3) : ["Business Management", "Marketing", "Communication"],
        target_market: `Customers in ${location || "Kenya"} interested in ${interests[0] || "this service"}`,
        startup_costs: getBudgetRange(budget),
        potential_challenges: ["Market competition", "Initial customer acquisition"],
        success_factors: ["Quality service/product", "Effective marketing"],
        market_trends: ["Growing digital adoption", "Increasing focus on local businesses"],
        success_rate_estimate: "Medium - Based on similar business models in the region",
        estimated_roi: "25-35% within 12-18 months",
        economic_data: {
          growth_potential: "Medium - Steady growth expected",
          market_saturation: "Medium - Some competition exists",
          competition_level: "Medium - Differentiation is key",
        },
      })
    }

    return ideas
  }

  // If we couldn't extract structured data, throw an error to fall back to default ideas
  throw new Error("Could not extract structured data from response")
}

// Update the fallback ideas function to include the new fields
function getFallbackIdeas(skills: string[], interests: string[], budget: string, location: string): GeneratedIdea[] {
  const fallbackIdeas: GeneratedIdea[] = [
    {
      title: `${skills[0] || "Local"} Services in ${location || "Kenya"}`,
      description: `A service business leveraging ${skills[0] || "local"} skills to serve the ${location || "Kenyan"} market. This business addresses local needs with minimal startup costs.`,
      skills_required: skills.length > 0 ? skills.slice(0, 3) : ["Communication", "Customer Service", "Marketing"],
      target_market: `Residents and businesses in ${location || "Kenya"} seeking ${skills[0] || "professional"} services`,
      startup_costs: getBudgetRange(budget),
      potential_challenges: ["Market competition", "Customer acquisition"],
      success_factors: ["Quality service delivery", "Strong local network"],
      // New fields
      market_trends: ["Increasing demand for specialized services", "Growth in mobile service delivery"],
      success_rate_estimate: "Medium - Service businesses have moderate success rates with proper execution",
      estimated_roi: "30-40% within 12-18 months",
      economic_data: {
        growth_potential: "Medium - Service sector is growing steadily in Kenya",
        market_saturation: "Medium - Varies by specific service type",
        competition_level: "Medium - Differentiation is key to success",
      },
    },
    {
      title: `${interests[0] || "Digital"} Products Platform`,
      description: `An online platform offering ${interests[0] || "digital"} products to customers. This business can be operated remotely with flexible hours.`,
      skills_required:
        skills.length > 0 ? skills.slice(0, 3) : ["Digital Marketing", "Content Creation", "Basic Tech Skills"],
      target_market: `Online customers interested in ${interests[0] || "digital"} products and services`,
      startup_costs: getBudgetRange(budget),
      potential_challenges: ["Online visibility", "Payment processing"],
      success_factors: ["Unique product offering", "Effective digital marketing"],
      // New fields
      market_trends: ["Increasing internet penetration in Kenya", "Growing comfort with online purchases"],
      success_rate_estimate: "Medium-High - Digital businesses have lower overhead and wider reach",
      estimated_roi: "50-70% within 12-24 months",
      economic_data: {
        growth_potential: "High - Digital economy is rapidly expanding",
        market_saturation: "Low to Medium - Many niches still underserved",
        competition_level: "Medium - Varies by specific digital product category",
      },
    },
    {
      title: `${interests[1] || "Local"} Retail Business`,
      description: `A retail business focusing on ${interests[1] || "local"} products for the ${location || "Kenyan"} market. This business combines physical and online presence for maximum reach.`,
      skills_required: skills.length > 1 ? skills.slice(1, 4) : ["Inventory Management", "Sales", "Customer Relations"],
      target_market: `Local consumers interested in ${interests[1] || "quality"} products`,
      startup_costs: getBudgetRange(budget),
      potential_challenges: ["Inventory management", "Cash flow"],
      success_factors: ["Strategic location", "Product differentiation"],
      // New fields
      market_trends: ["Growing middle class in urban areas", "Increasing preference for local products"],
      success_rate_estimate: "Medium - Retail requires careful planning and management",
      estimated_roi: "20-30% within 18-24 months",
      economic_data: {
        growth_potential: "Medium - Retail sector grows with the economy",
        market_saturation: "Medium to High - Depends on product category",
        competition_level: "High - Established retail chains present challenges",
      },
    },
  ]

  return fallbackIdeas
}

// Helper function to get budget range
function getBudgetRange(budget: string): string {
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
      return "Various budget levels"
  }
}
