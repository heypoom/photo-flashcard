import type { Language } from "~/types/language"

export function getPhotoToWordPrompt(languages: Language[]) {
  const languageNames: Record<Language, string> = {
    zh: "Simplified Chinese (zh) with English translation",
    ja: "Japanese (ja) with English translation",
    en: "English (en) with Thai translation",
    vi: "Vietnamese (vi) with English translation",
  }

  const pronunciationFormats: Record<Language, string> = {
    zh: "pinyin",
    ja: "romaji",
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
    meaning: "<translation>",
    pronunciation: "<pronunciation>", 
    language: "<language code>"
  },
  ...
]

Use ${languages.map((lang) => `${pronunciationFormats[lang]} for ${languageNames[lang]}`).join(", ")} pronunciations respectively.`

  return prompt
}
