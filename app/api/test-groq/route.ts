import { groq } from "@ai-sdk/groq"
import { generateText } from "ai"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Simple test prompt with explicit JSON formatting instructions
    const { text } = await generateText({
      model: groq("llama3-70b-8192"),
      prompt:
        'Generate a simple business idea for Kenya. Format your response as a valid JSON object with the following structure: {"idea": "Your business idea here"}. Do not include any text before or after the JSON.',
      temperature: 0.7,
      maxTokens: 100,
    })

    // Log the raw response
    console.log("Raw Groq test response:", text)

    // Try to parse the JSON response
    let parsedResponse
    try {
      parsedResponse = JSON.parse(text)
    } catch (parseError) {
      console.error("Error parsing test response:", parseError)

      // Try to extract JSON using regex
      const jsonMatch = text.match(/\{.*\}/s)
      if (jsonMatch) {
        try {
          parsedResponse = JSON.parse(jsonMatch[0])
        } catch (extractError) {
          console.error("Error extracting JSON from test response:", extractError)
          parsedResponse = { idea: text }
        }
      } else {
        parsedResponse = { idea: text }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Groq API connection successful",
      result: parsedResponse.idea || text,
      rawResponse: text,
    })
  } catch (error) {
    console.error("Groq API test error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to connect to Groq API",
        error: String(error),
      },
      { status: 500 },
    )
  }
}
