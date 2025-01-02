import { SchemaType, type GenerationConfig } from "@google/generative-ai"

import { gemini } from "./google-ai"

import { getPhotoToWordPrompt } from "~/constants/prompt"

export async function predictWordAndMeaning(
  photoBuffer: Buffer,
  language: Language = "cn",
) {
  const generationConfig: GenerationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "application/json",
    responseSchema: {
      type: SchemaType.OBJECT,
      properties: {
        word: {
          type: SchemaType.STRING,
        },
        meaning: {
          type: SchemaType.STRING,
        },
        pronunciation: {
          type: SchemaType.STRING,
        },
      },
      required: ["word", "meaning", "pronunciation"],
    } as const,
  }

  gemini.generationConfig = generationConfig

  const result = await gemini.generateContent([
    getPhotoToWordPrompt(language),
    {
      inlineData: {
        data: photoBuffer.toString("base64"),
        mimeType: "image/png",
      },
    },
  ])

  let prediction: {
    word: string
    meaning: string
    pronunciation: string
  } | null

  try {
    prediction = JSON.parse(result.response.text())
  } catch (error) {
    return null
  }

  return prediction
}
