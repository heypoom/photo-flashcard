import { SchemaType, type GenerationConfig } from "@google/generative-ai"

import { genAI } from "./google-ai"

export async function verifyWordChallenge(
  photoBuffer: Buffer,
  word: string,
): Promise<boolean> {
  const generationConfig: GenerationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 3,
    maxOutputTokens: 128,
    responseMimeType: "application/json",
    responseSchema: {
      type: SchemaType.OBJECT,
      properties: {
        isCorrect: {
          type: SchemaType.BOOLEAN,
        },
      },
      required: ["isCorrect"],
    } as const,
  }

  const gemini = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-exp",
    generationConfig,
  })

  const verifyPrompt = `
    Does the most prominent object in the photo matches this word: ${word}
    Provide the response in { isCorrect: boolean }
  `

  const result = await gemini.generateContent([
    verifyPrompt,
    {
      inlineData: {
        data: photoBuffer.toString("base64"),
        mimeType: "image/png",
      },
    },
  ])

  let prediction: { isCorrect?: boolean } | null

  try {
    prediction = JSON.parse(result.response.text())
  } catch (error) {
    return false
  }

  console.log(`--- challenge verify prediction:`, prediction)

  return prediction?.isCorrect ?? false
}
