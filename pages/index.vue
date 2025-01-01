<script setup lang="ts">
  import AddPhoto from "../components/AddPhoto.vue"
  import SpeakButton from "../components/SpeakButton.vue"

  interface WordEntry {
    id: string
    attachmentId: string
    Word: string
    Meaning: string
    Pronunciation: string
  }

  const {data: words, refresh} = useFetch<WordEntry[]>('/api/words')
</script>

<template>
  <div class="bg-slate-950 min-h-screen">
    <section class="container mx-auto px-4 py-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div v-for="word in words" class="flex flex-col bg-slate-900 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-4 justify-between">
          <div class="relative">
            <img 
              v-if="word.attachmentId"
              :src="`/api/attachment/${word.attachmentId}`"
              class="pb-4 aspect-square object-cover w-full"
            />

            <div class="absolute right-4 bottom-1">
              <SpeakButton :word="word.Word"/>
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

    <AddPhoto v-on:success="refresh" />
  </div>
</template>
