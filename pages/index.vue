<script lang="ts" setup>
import { Icon } from "@iconify/vue"
import { ref } from "vue"
import type { Language } from "~/types/language"

const {
  data: albums,
  refresh,
  status,
} = useFetch<
  Array<{
    id: string
    name: string
    wordCount: number
    languages: Language[]
  }>
>("/api/albums")

const isCreateDialogOpen = ref(false)
const newAlbumName = ref("")
const selectedLanguages = ref<Language[]>([])
const isCreatingAlbum = ref(false)

const availableLanguages: { value: Language; label: string }[] = [
  { value: "zh", label: "Chinese" },
  { value: "ja", label: "Japanese" },
  { value: "en", label: "English" },
  { value: "vi", label: "Vietnamese" },
]

async function createAlbum() {
  if (!newAlbumName.value || selectedLanguages.value.length === 0) return

  isCreatingAlbum.value = true
  try {
    await $fetch("/api/albums", {
      method: "POST",
      body: {
        name: newAlbumName.value,
        languages: selectedLanguages.value,
      },
    })

    newAlbumName.value = ""
    selectedLanguages.value = []
    isCreateDialogOpen.value = false
    refresh()
  } finally {
    isCreatingAlbum.value = false
  }
}
</script>

<template>
  <div class="bg-slate-950 min-h-screen">
    <div
      v-if="status === 'pending'"
      class="w-full flex items-center justify-center pb-5 min-h-screen fixed left-0 top-0 pointer-events-none"
    >
      <Icon
        icon="solar:refresh-broken"
        class="animate-spin text-6xl text-white"
      />
    </div>

    <section class="container mx-auto px-4 py-6">
      <h1 class="text-4xl font-light text-white mb-8">My Albums</h1>

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <NuxtLink
          v-for="album in albums"
          :key="album.id"
          :to="`/albums/${album.id}`"
          class="block transition-transform hover:scale-[1.02]"
        >
          <div
            class="bg-slate-900 rounded-lg p-6 hover:bg-slate-800 transition-colors"
          >
            <div class="flex items-center justify-between mb-4">
              <Icon
                icon="solar:album-line-duotone"
                class="w-6 h-6 text-white"
              />
              <div class="text-slate-400 text-sm">
                {{ album.wordCount }} words
              </div>
            </div>

            <div class="text-white text-2xl font-light mb-3">
              {{ album.name }}
            </div>

            <div class="flex gap-2">
              <span
                v-for="lang in album.languages"
                :key="lang"
                class="px-2 py-1 rounded bg-slate-800 text-xs text-slate-300"
              >
                {{ availableLanguages.find((l) => l.value === lang)?.label }}
              </span>
            </div>
          </div>
        </NuxtLink>

        <div v-if="isCreateDialogOpen" class="bg-slate-900 rounded-lg p-6">
          <input
            v-model="newAlbumName"
            type="text"
            placeholder="Album name"
            class="w-full bg-slate-800 text-white px-3 py-2 rounded mb-4"
            @keyup.enter="createAlbum"
          />
          <div class="mb-4">
            <div class="text-white mb-2">Languages:</div>
            <div class="space-y-2">
              <label
                v-for="lang in availableLanguages"
                :key="lang.value"
                class="flex items-center text-white cursor-pointer"
              >
                <input
                  type="checkbox"
                  :value="lang.value"
                  v-model="selectedLanguages"
                  class="mr-2"
                />
                {{ lang.label }}
              </label>
            </div>
          </div>
          <div class="flex gap-2">
            <button
              @click="createAlbum"
              class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              :disabled="
                !newAlbumName ||
                selectedLanguages.length === 0 ||
                isCreatingAlbum
              "
            >
              <Icon
                v-if="isCreatingAlbum"
                icon="eos-icons:loading"
                class="animate-spin"
              />
              {{ isCreatingAlbum ? "Creating..." : "Create" }}
            </button>
            <button
              @click="isCreateDialogOpen = false"
              class="bg-slate-700 text-white px-4 py-2 rounded hover:bg-slate-600"
            >
              Cancel
            </button>
          </div>
        </div>

        <button
          v-else
          @click="isCreateDialogOpen = true"
          class="bg-slate-900 rounded-lg p-6 hover:bg-slate-800 transition-colors flex items-center justify-center"
        >
          <Icon
            icon="solar:add-circle-line-duotone"
            class="w-12 h-12 text-white"
          />
        </button>
      </div>
    </section>
  </div>
</template>
