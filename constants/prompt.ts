import type { Language } from "~/types/language"

export function getPhotoToWordPrompt(languages: Language[]) {
  const languageNames: Record<Language, string> = {
    cn: "Simplified Chinese",
    jp: "Japanese",
    en: "English",
    vi: "Vietnamese",
  }

  const pronunciationFormats: Record<Language, string> = {
    cn: "pinyin",
    jp: "romaji",
    en: "IPA",
    vi: "Vietnamese pronunciation",
  }

  const languageList = languages.map((lang) => languageNames[lang]).join(", ")

  const prompt = `Return the most prominent object as a single word in the photo, translated into ${languageList}. 
Objective is language learning from photos.

Provide the response as an array of translations in this format:
[
  {
    word: "<word in target language>",
    meaning: "<english translation>", 
    pronunciation: "<pronunciation>",
    language: "<language code>"
  },
  ...
]

Use ${languages.map((lang) => `${pronunciationFormats[lang]} for ${languageNames[lang]}`).join(", ")} pronunciations respectively.`

  return prompt
}
