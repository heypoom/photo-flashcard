<script lang="ts" setup>
  import {Icon} from "@iconify/vue"
  
  import type {WordEntry} from "../types/word-entry"

  const {data: word, refresh, status} = useFetch<WordEntry>('/api/challenge/word')

  const isPending = computed(() => status.value === 'pending')

  function nextWord() {
    if (isPending.value) return

    refresh()
  }
</script>

<template>
  <div class="bg-slate-950 min-h-screen flex flex-col justify-center px-8 items-center">
    <section v-if="word">
      <div class="p-4">
        <div class="text-white text-4xl font-bold mb-2">{{ word.Word }}</div>
        <div class="text-white text-2xl">{{ word.Pronunciation }}</div>
      </div>
    </section>

    <div class="fixed bottom-5">
      <div class="w-full flex justify-center gap-x-2">
        <SpeakButton v-if="word" :word="word.Word" class="!bg-blue-500 !text-4xl"/>

        <Icon
          icon="solar:refresh-circle-outline"
          class="text-4xl text-white bg-red-500 hover:bg-red-700 p-1 rounded-full cursor-pointer"
          @click="nextWord"
          :class="{ 'animate-spin opacity-50 cursor-progress': isPending }"
        />
      </div>
    </div>

    <div class="fixed top-5 left-5">
      <NuxtLink to="/">
        <Icon
          icon="solar:arrow-left-linear"
          class="text-4xl text-white bg-slate-600 hover:bg-slate-700 p-1 rounded-full cursor-pointer"
        />
      </NuxtLink>
    </div>
  </div>
</template>