<script lang="ts" setup>
import { Icon } from "@iconify/vue"

import { speakWithPolly } from "../utils/polly"
import type { Language } from "~/types/language"

const props = defineProps<{
  word?: string
  class?: string
  language: string
}>()

const isLoading = ref(false)

async function speak() {
  if (!props.word || isLoading.value) {
    return
  }

  isLoading.value = true

  try {
    await speakWithPolly(props.word, props.language as Language)
  } finally {
    isLoading.value = false
  }
}

const className = computed(() => [
  "flex items-center justify-center cursor-pointer text-white bg-gray-700 hover:bg-gray-800 p-[8px] rounded-full",
  isLoading.value && "opacity-50",
  props.class,
])
</script>

<template>
  <div :class="className">
    <Icon icon="solar:user-speak-outline" class="text-[24px]" @click="speak" />
  </div>
</template>
