import type { Language } from "~/types/language"

export function getPhotoToWordPrompt(languages: Language[]) {
  const languageNames: Record<Language, string> = {
    zh: "Simplified Chinese (zh)",
    ja: "Hiragana or Katakana (ja)",
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
    notices += `- Do not use Kanji. Write easy native Japanese words in hiragana and loanwords in katakana, for beginner language learning.
- You must use romaji for Japanese pronunciations, such as akari or rōsoku.`
  }

  const prompt = `Return the most prominent object as a single word in the photo, translated into these languages only: ${languageList}.

Instructions:

- Objective is language learning from photos.
- Return one entry per language. Translation must be provided in the same object.
- You must use these languages for translations: ${translationFormatList}.
- You must use these formats for pronunciations: ${pronunciationFormatList}.
${notices}

Provide the response as an array in this format:
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
