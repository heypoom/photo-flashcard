<script setup lang="ts">
import { Icon } from "@iconify/vue"

import { prepareGuestCredentials } from "../../utils/polly"
import type { WordEntry } from "../../types/word-entry"
import type { Album } from "~/types/album"
import type { Language } from "~/types/language"

const route = useRoute()
const albumId = String(route.params.id)

const {
  data: words,
  refresh,
  status,
} = useFetch<WordEntry[]>(`/api/words/${albumId}`)

const { data: album, status: albumStatus } = useFetch<Album>(
  `/api/albums/${albumId}`,
)

const languageNames: Record<Language, string> = {
  zh: "Chinese",
  ja: "Japanese",
  en: "English",
  vi: "Vietnamese",
}

const selectedLanguage = ref<string | null>(null)

watch(album, (nextAlbum) => {
  selectedLanguage.value = nextAlbum?.Languages?.[0] ?? null
})

const filteredWords = computed(() => {
  if (!words.value || !selectedLanguage.value) return words.value

  return words.value.filter((word) => word.Language === selectedLanguage.value)
})

onMounted(() => {
  prepareGuestCredentials()
})
</script>

<template>
  <div class="bg-slate-950 min-h-screen">
    <section class="container mx-auto px-4 py-6">
      <div
        v-if="status === 'pending' || albumStatus === 'pending'"
        class="w-full flex items-center justify-center pb-5 min-h-screen fixed left-0 top-0 pointer-events-none z-10"
      >
        <Icon
          icon="solar:refresh-broken"
          class="animate-spin text-6xl text-white"
        />
      </div>

      <div
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
      >
        <template
          v-if="
            album &&
            album.Languages &&
            album.Languages.length > 1 &&
            selectedLanguage
          "
        >
          <div class="col-span-full mb-4 pt-14">
            <select
              v-model="selectedLanguage"
              class="bg-slate-800 text-white px-4 py-2 rounded-lg w-48"
            >
              <option v-for="lang in album.Languages" :key="lang" :value="lang">
                {{ languageNames[lang] }}
              </option>
            </select>
          </div>
        </template>

        <div
          v-if="albumStatus === 'success'"
          v-for="word in filteredWords"
          class="flex flex-col bg-slate-900 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-4 justify-between"
        >
          <div class="relative">
            <img
              v-if="word.attachmentId"
              :src="`/api/attachment/${word.attachmentId}`"
              class="pb-4 aspect-square object-cover w-full"
            />

            <div class="absolute right-4 bottom-[-2px]">
              <SpeakButton :word="word.Word" :language="word.Language" />
            </div>
          </div>

          <div class="p-4">
            <div class="text-white text-xl font-bold mb-2">{{ word.Word }}</div>
            <div class="text-white mb-1">{{ word.Meaning }}</div>
            <div class="text-white text-sm">{{ word.Pronunciation }}</div>
          </div>
        </div>
      </div>
    </section>

    <section
      class="flex justify-center w-full fixed bottom-5 gap-x-3 items-end"
    >
      <AddPhoto
        @success="refresh"
        :albumId="albumId"
        :languages="album?.Languages ?? []"
      />
    </section>

    <section
      class="flex flex-col fixed right-5 top-5 gap-y-4 z-auto"
      v-if="!isFullscreenWidgetOpen"
    >
      <NuxtLink :to="`/challenge/${albumId}`">
        <Icon
          icon="solar:play-circle-line-duotone"
          class="text-[40px] size-[40px] p-[6px] text-white bg-indigo-500 hover:bg-indigo-600 rounded-full cursor-pointer"
        />
      </NuxtLink>

      <NuxtLink :to="`/challenge/multiplayer/${albumId}`">
        <Icon
          icon="solar:users-group-rounded-line-duotone"
          class="text-[40px] size-[40px] p-[6px] text-white bg-indigo-500 hover:bg-indigo-600 rounded-full cursor-pointer"
        />
      </NuxtLink>
    </section>
  </div>

  <div class="fixed top-5 left-5" v-if="!isFullscreenWidgetOpen">
    <NuxtLink to="/">
      <Icon
        icon="solar:arrow-left-linear"
        class="text-4xl text-white bg-slate-600 hover:bg-slate-700 p-1 rounded-full cursor-pointer"
      />
    </NuxtLink>
  </div>
</template>
