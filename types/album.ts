import type { Language } from "./language"

export interface Album {
  id: number
  manualSort: number
  Name: string
  CreatedAt: number
  Languages: Language[]
}
