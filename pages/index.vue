<script lang="ts" setup>
import { Icon } from "@iconify/vue"
import { ref } from "vue"

const { data: albums, refresh } = await useFetch<
  Array<{
    id: string
    name: string
    wordCount: number
  }>
>("/api/albums")

const isCreating = ref(false)
const newAlbumName = ref("")

async function createAlbum() {
  if (!newAlbumName.value) return

  await $fetch("/api/albums", {
    method: "POST",
    body: {
      name: newAlbumName.value,
    },
  })

  newAlbumName.value = ""
  isCreating.value = false
  refresh()
}
</script>

<template>
  <div class="bg-slate-950 min-h-screen">
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
              <h2 class="text-2xl font-light text-white">{{ album.name }}</h2>
              <Icon
                icon="solar:album-line-duotone"
                class="text-3xl text-white opacity-75"
              />
            </div>
            <p class="text-slate-400 text-sm">{{ album.wordCount }} words</p>
          </div>
        </NuxtLink>

        <!-- Add Album Button/Form -->
        <div
          class="bg-slate-900 rounded-lg p-6 border-2 border-dashed border-slate-700 hover:border-slate-500 hover:bg-slate-800 transition-all group"
        >
          <div
            v-if="!isCreating"
            class="flex items-center justify-center h-full"
          >
            <button @click="isCreating = true">
              <Icon
                icon="solar:add-circle-line-duotone"
                class="text-4xl text-slate-700 group-hover:text-slate-500 transition-colors"
              />
            </button>
          </div>

          <form
            v-else
            @submit.prevent="createAlbum"
            class="flex flex-col gap-4"
          >
            <input
              v-model="newAlbumName"
              type="text"
              placeholder="Album name"
              class="bg-slate-800 text-white px-4 py-2 rounded-lg border border-slate-700 focus:border-slate-500 focus:outline-none"
              autofocus
            />
            <div class="flex gap-2">
              <button
                type="submit"
                class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create
              </button>
              <button
                type="button"
                @click="isCreating = false"
                class="flex-1 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  </div>
</template>
