import type { Language } from "~/types/language"

export function getPhotoToWordPrompt(languages: Language[]) {
  const languageNames: Record<Language, string> = {
    zh: "Simplified Chinese (zh)",
    ja: "Hiragana/Katakana Japanese (ja)",
    en: "English (en)",
    vi: "Vietnamese (vi)",
  }

  const pronunciationFormats: Record<Language, string> = {
    zh: "pinyin",
    ja: "romaji",
    en: "IPA",
    vi: "IPA",
  }

  const translationFormats: Record<Language, string> = {
    zh: "English",
    ja: "English",
    en: "Thai (ภาษาไทย)",
    vi: "English",
  }

  const languageList = languages.map((lang) => languageNames[lang]).join(", ")

  const pronunciationFormatList = languages
    .map((lang) => `${pronunciationFormats[lang]} for ${lang}`)
    .join(", ")

  const translationFormatList = languages
    .map((lang) => `${translationFormats[lang]} for ${lang}`)
    .join(", ")

  let notices = ""

  if (languages.includes("ja")) {
    notices +=
      "- Avoid Kanji. Use easy native Japanese words instead of loanwords when possible."
  }

  const prompt = `Return the most prominent object as a single word in the photo, translated into these languages only: "${languageList}".
Objective is language learning from photos. Instructions:

- Use these languages for translations: ${translationFormatList}.
- Use these formats for pronunciations: ${pronunciationFormatList}.
${notices}

Provide the response as an array of translations in this format:
[
  {
    word: "<word in target language>",
    meaning: "<translation>",
    pronunciation: "<pronunciation>", 
    language: "<language code of target language>"
  },
  ...
]`

  return prompt
}
