import {PHOTO_TO_WORD_PROMPT} from '~/constants/prompt'

import {
  GoogleGenerativeAI,
  SchemaType,
  type GenerationConfig,
} from '@google/generative-ai'

const apiKey = process.env.GEMINI_API_KEY ?? ''

const genAI = new GoogleGenerativeAI(apiKey)

const model = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash-exp',
  systemInstruction: PHOTO_TO_WORD_PROMPT,
})

const generationConfig: GenerationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: 'application/json',
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
    required: ['word', 'meaning', 'pronunciation'],
  } as const,
}

export async function predictWordAndMeaning(photoBuffer: Buffer) {
  model.generationConfig = generationConfig

  const result = await model.generateContent([
    PHOTO_TO_WORD_PROMPT,
    {
      inlineData: {
        data: photoBuffer.toString('base64'),
        mimeType: 'image/png',
      },
    },
  ])

  let prediction: {word: string; meaning: string; pronunciation: string} | null

  try {
    prediction = JSON.parse(result.response.text())
  } catch (error) {
    return null
  }

  return prediction
}
