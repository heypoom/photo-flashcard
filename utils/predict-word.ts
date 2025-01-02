import { SchemaType, type GenerationConfig } from "@google/generative-ai"

import { genAI } from "./google-ai"

import { getPhotoToWordPrompt } from "~/constants/prompt"
import type { Language } from "~/types/language"
import type { Prediction } from "~/types/prediction"

export async function predictWordAndMeaning(
  photoBuffer: Buffer,
  languages: Language[],
): Promise<Prediction[] | null> {
  const generationConfig: GenerationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "application/json",
    responseSchema: {
      type: SchemaType.ARRAY,
      items: {
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
          language: {
            type: SchemaType.STRING,
          },
        },
        required: ["word", "meaning", "pronunciation", "language"],
      },
    } as const,
  }

  const gemini = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-exp",
    generationConfig,
    systemInstruction: getPhotoToWordPrompt(languages),
  })

  const result = await gemini.generateContent([
    "translate",
    {
      inlineData: {
        data: photoBuffer.toString("base64"),
        mimeType: "image/png",
      },
    },
  ])

  let predictions: Prediction[] | null

  try {
    predictions = JSON.parse(result.response.text())
  } catch (error) {
    return null
  }

  return predictions
}
