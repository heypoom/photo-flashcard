<script setup lang="ts">
import { Icon } from "@iconify/vue"

import { prepareGuestCredentials } from "../../utils/polly"
import type { WordEntry } from "../../types/word-entry"

const { data: words, refresh, status } = useFetch<WordEntry[]>("/api/words")

onMounted(() => {
  prepareGuestCredentials()
})
</script>

<template>
  <div class="bg-slate-950 min-h-screen">
    <section class="container mx-auto px-4 py-6">
      <div
        v-if="status === 'pending'"
        class="w-full flex items-center justify-center pb-5 min-h-screen fixed left-0 top-0 pointer-events-none"
      >
        <Icon
          icon="solar:refresh-broken"
          class="animate-spin text-6xl text-white"
        />
      </div>

      <div
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
      >
        <div
          v-for="word in words"
          class="flex flex-col bg-slate-900 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-4 justify-between"
        >
          <div class="relative">
            <img
              v-if="word.attachmentId"
              :src="`/api/attachment/${word.attachmentId}`"
              class="pb-4 aspect-square object-cover w-full"
            />

            <div class="absolute right-4 bottom-[-2px]">
              <SpeakButton :word="word.Word" />
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
      <AddPhoto v-on:success="refresh" />
    </section>

    <section class="flex fixed right-5 top-5">
      <NuxtLink
        to="/challenge"
        class="size-[40px] p-2 flex items-center justify-center bg-green-500 text-white rounded-full shadow-xl cursor-pointer"
      >
        <Icon icon="solar:test-tube-outline" class="text-[30px]" />
      </NuxtLink>
    </section>
  </div>
</template>
