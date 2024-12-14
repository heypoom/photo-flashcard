<script setup lang="ts">
  import AddPhoto from "../components/AddPhoto.vue"

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
  <section class="container mx-auto">
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <div v-for="word in words" class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-4">
        <img 
          v-if="word.attachmentId"
          :src="`/api/attachment/${word.attachmentId}`"
          class="pb-4"
        />

        <div class="p-4">
          <div class="text-xl font-bold mb-2">{{ word.Word }}</div>
          <div class="text-gray-700 mb-1">{{ word.Meaning }}</div>
          <div class="text-gray-500 text-sm">{{ word.Pronunciation }}</div>
        </div>
      </div>
    </div>
  </section>

  <section>
    <div class="p-6">
      <AddPhoto v-on:success="refresh" />
    </div>
  </section>
</template>
