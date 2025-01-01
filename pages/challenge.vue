<script lang="ts" setup>
  import {Icon} from "@iconify/vue"
  import { ref } from 'vue'
  import Compressor from "compressorjs"
  
  import type {WordEntry} from "../types/word-entry"

  const {data: word, refresh, status} = useFetch<WordEntry>('/api/challenge/word')

  const isLoadingWord = computed(() => status.value === 'pending')

  function nextWord() {
    if (isLoadingWord.value) return

    refresh()
  }

  const uploadingRef = ref(false)
  const isCorrectRef = ref<boolean | null>(null)

  const compress = (file: File) => new Promise<File | Blob>(resolve => {
    new Compressor(file, {
      quality: 0.2,
      width: 500,
      height: 500,
      success: resolve,
      resize: "cover"
    })
  })

  async function uploadAndVerifyWordChallenge(event: Event) {
    uploadingRef.value = true
    const target = event.target as HTMLInputElement

    const file = target.files?.[0]

    if (!file) {
      return
    }

    const compressedFile = await compress(file)

    const entry = word.value
    const targetWord = `${entry?.Word ?? ''} (meaning: ${entry?.Meaning})`

    const formData = new FormData()
    formData.append('photo', compressedFile)
    formData.append('word', targetWord)

    console.log('--- verifying')

    const response = await fetch('/api/verify/word', {
      method: 'POST',
      body: formData
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

  const uploadIcon = computed(() => {
    if (isCorrectRef.value === true) return 'solar:check-read-outline'
    if (isCorrectRef.value === false) return 'solar:list-cross-minimalistic-linear'

    if (uploadingRef.value) return 'solar:clock-circle-outline'
    
    return 'solar:camera-bold'
  })

  const uploadIconClass = computed(() => {
    if (isLoadingWord.value) {
      return 'bg-slate-800 opacity-50 cursor-progress'
    }

    return {
      'opacity-30 animate-spin cursor-progress': uploadingRef.value,
      'bg-pink-500': isCorrectRef.value === null,
      'bg-orange-500': isCorrectRef.value === false,
      'bg-green-500': isCorrectRef.value === true,
    }
  })
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
      <div class="w-full flex justify-center gap-x-3">
        <div class="flex">
          <input id="file-upload" type="file" v-on:change="uploadAndVerifyWordChallenge" class="hidden" :disabled="uploadingRef" />

          <label for="file-upload">
            <div
              class="text-white p-2 rounded-full shadow-xl cursor-pointer"
              :class="uploadIconClass"
            >
              <Icon
                :icon="uploadIcon"
                class="text-3xl"
              />
            </div>
          </label>
        </div>
        
        <SpeakButton v-if="word" :word="word.Word" class="!bg-blue-500 size-[45px]" />

        <Icon
          icon="solar:refresh-bold"
          class="text-[45px] size-[45px] p-[6px] text-white bg-slate-500 hover:bg-slate-700 rounded-full cursor-pointer"
          @click="nextWord"
          :class="{ 'animate-spin opacity-50 cursor-progress': isLoadingWord }"
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