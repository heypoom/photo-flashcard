<script lang="ts" setup>
import { Icon } from "@iconify/vue"
import { ref } from "vue"
import Compressor from "compressorjs"

import type { WordEntry } from "../../types/word-entry"
import type { Language } from "../../types/language"
import type { Album } from "../../types/album"

const route = useRoute()
const albumId = route.params.albumId

const selectedLanguage = ref<Language | null>(null)

// Fetch album metadata which includes available languages
const { data: album } = useFetch<Album>(`/api/albums/${albumId}`)

watch(album, (nextAlbum) => {
  console.log("--- album", nextAlbum)
  selectedLanguage.value = nextAlbum?.Languages?.[0] ?? null
})

const hasMultipleLanguages = computed(
  () => (album.value?.Languages?.length ?? 0) > 1,
)

const {
  data: word,
  refresh,
  status,
} = useFetch<WordEntry>(`/api/challenge/${albumId}`, {
  query: computed(() => ({
    language: selectedLanguage.value,
  })),
  lazy: true,
  immediate: false,
})

const isLoading = computed(() => !album.value || status.value === "pending")

function nextWord() {
  if (isLoading.value) return

  refresh()
}

const uploadingRef = ref(false)
const isCorrectRef = ref<boolean | null>(null)

const compress = (file: File) =>
  new Promise<File | Blob>((resolve) => {
    new Compressor(file, {
      quality: 0.2,
      width: 500,
      height: 500,
      success: resolve,
      resize: "cover",
    })
  })

async function handleCapture(file: File) {
  uploadingRef.value = true

  const compressedFile = await compress(file)

  const entry = word.value
  const targetWord = `${entry?.Word ?? ""} (meaning: ${entry?.Meaning})`

  const formData = new FormData()
  formData.append("photo", compressedFile)
  formData.append("word", targetWord)

  console.log("--- verifying")

  const response = await fetch("/api/verify/word", {
    method: "POST",
    body: formData,
  })

  const { isCorrect = false } = await response.json()

  uploadingRef.value = false
  isCorrectRef.value = isCorrect

  setTimeout(() => {
    isCorrectRef.value = null

    if (isCorrect) {
      nextWord()
    }
  }, 3000)
}

// Add language display names
const languageNames: Record<Language, string> = {
  en: "English",
  ja: "Japanese",
  zh: "Chinese",
  vi: "Vietnamese",
}
</script>

<template>
  <div
    class="bg-slate-950 min-h-screen flex flex-col justify-center px-8 items-center"
  >
    <div
      v-if="isLoading && !word && album"
      class="w-full flex items-center justify-center pb-5 min-h-screen fixed left-0 top-0 pointer-events-none"
    >
      <Icon
        icon="solar:refresh-broken"
        class="animate-spin text-6xl text-gray-400"
      />
    </div>

    <section v-if="word">
      <div class="p-4">
        <div class="text-white text-4xl font-bold mb-2">{{ word.Word }}</div>
        <div class="text-white text-2xl">{{ word.Pronunciation }}</div>
      </div>
    </section>

    <div class="fixed bottom-5">
      <div class="w-full flex justify-center items-end gap-x-3">
        <CameraCapture
          @capture="handleCapture"
          :uploading="uploadingRef"
          :is-correct="isCorrectRef"
        />

        <SpeakButton
          v-if="word"
          :word="word.Word"
          :language="word.Language"
          class="!bg-blue-500 size-[45px]"
        />

        <DrawingButton @finish="handleCapture" />

        <Icon
          icon="solar:refresh-broken"
          class="text-[45px] size-[45px] p-[6px] text-white bg-slate-500 hover:bg-slate-700 rounded-full cursor-pointer"
          @click="nextWord"
          :class="{ 'animate-spin opacity-50 cursor-progress': isLoading }"
        />
      </div>
    </div>

    <div class="fixed top-5 left-5" v-if="!isFullscreenWidgetOpen">
      <NuxtLink :to="`/albums/${albumId}`">
        <Icon
          icon="solar:arrow-left-linear"
          class="text-4xl text-white bg-slate-600 hover:bg-slate-700 p-1 rounded-full cursor-pointer"
        />
      </NuxtLink>
    </div>

    <div
      v-if="hasMultipleLanguages && !isFullscreenWidgetOpen"
      class="fixed top-5 right-5"
    >
      <select
        v-model="selectedLanguage"
        class="bg-slate-700 text-white px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-600 transition-colors"
      >
        <option
          v-for="lang in album?.Languages ?? []"
          :key="lang"
          :value="lang"
        >
          {{ languageNames[lang] }}
        </option>
      </select>
    </div>
  </div>

  <ConfettiEffect v-if="isCorrectRef === true" />
</template>
