import { groq } from "@ai-sdk/groq"
import { generateText } from "ai"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Simple test to check if Groq is connected
    const { text } = await generateText({
      model: groq("llama3-8b-8192"),
      prompt: "Respond with 'Groq is working!' if you can read this.",
      maxTokens: 10,
    })

    return NextResponse.json({
      success: true,
      message: "Groq API is connected successfully",
      response: text,
    })
  } catch (error) {
    console.error("Groq API test error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Groq API connection error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
