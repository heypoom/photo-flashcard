import type { Language } from "./language"

export interface Prediction {
  word: string
  meaning: string
  pronunciation: string
  language: Language
}
