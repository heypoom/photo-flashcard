import type { Language } from "@/utils/polly"

export function getPhotoToWordPrompt(language: Language) {
  const promptsForLanguage: Record<Language, string> = {
    cn: `Return the most prominent object as a single word in the photo, and their translation in Simplified Chinese. Objective is language learning from photos. Provide the response in { word: "<chinese word>", meaning: "<english translation>", pronunciation: "<pronunciation of chinese word in pinyin>" }`,
    jp: `Return the most prominent object as a single word in the photo, and their translation in Japanese. Objective is language learning from photos. Provide the response in { word: "<japanese word>", meaning: "<english translation>", pronunciation: "<pronunciation of japanese word in romaji>" }`,
    en: `Return the most prominent object as a single word in the photo in English. Objective is language learning from photos. Provide the response in { word: "<english word>", meaning: "<english definition>", pronunciation: "<pronunciation in IPA>" }`,
  }

  return promptsForLanguage[language]
}
