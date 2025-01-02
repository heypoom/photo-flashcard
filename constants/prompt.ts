import type { Language } from "~/types/language"

export function getPhotoToWordPrompt(languages: Language[]) {
  const languageNames: Record<Language, string> = {
    zh: "Simplified Chinese (zh)",
    ja: "Japanese (ja)",
    en: "English (en)",
    vi: "Vietnamese (vi)",
  }

  const pronunciationFormats: Record<Language, string> = {
    zh: "pinyin",
    ja: "romaji",
    en: "IPA",
    vi: "IPA",
  }

  const languageList = languages.map((lang) => languageNames[lang]).join(", ")

  // TODO: make the home language per-user as each user has a differing native tongue
  const translation = languages.includes("en")
    ? "thai translation"
    : "english translation"

  const prompt = `Return the most prominent object as a single word in the photo, translated into these languages only: "${languageList}".
Objective is language learning from photos.

Provide the response as an array of translations in this format:
[
  {
    word: "<word in target language>",
    meaning: "<${translation}>",
    pronunciation: "<pronunciation>", 
    language: "<language code of target language>"
  },
  ...
]

Use ${languages.map((lang) => `${pronunciationFormats[lang]} for ${languageNames[lang]}`).join(", ")} pronunciations respectively.`

  return prompt
}
