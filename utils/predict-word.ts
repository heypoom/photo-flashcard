import {SchemaType, type GenerationConfig} from '@google/generative-ai'

import {gemini} from './google-ai'

import {PHOTO_TO_WORD_PROMPT} from '~/constants/prompt'

export async function predictWordAndMeaning(photoBuffer: Buffer) {
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

  gemini.generationConfig = generationConfig

  const result = await gemini.generateContent([
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
