import { GoogleGenerativeAI } from "@google/generative-ai"

const apiKey = process.env.GEMINI_API_KEY ?? ""

export const genAI = new GoogleGenerativeAI(apiKey)
