import { GoogleGenerativeAI } from "@google/generative-ai"

const apiKey = process.env.GEMINI_API_KEY ?? ""

const genAI = new GoogleGenerativeAI(apiKey)

export const gemini = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-exp",
})
