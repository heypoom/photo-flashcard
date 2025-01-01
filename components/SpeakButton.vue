<script lang="ts" setup>
  import {Icon} from '@iconify/vue'

  import {speakWithPolly} from "../utils/polly"

  const props = defineProps<{
    word?: string
  }>()

  const isLoading = ref(false)

  async function speak() {
    if (!props.word || isLoading.value) {
      return
    }

    isLoading.value = true

    try {
      await speakWithPolly(props.word)
    } finally {
      isLoading.value = false
    }
  }
</script>

<template>
  <Icon
    icon="solar:user-speak-bold"
    class="text-[33px] cursor-pointer text-white bg-gray-700 hover:bg-gray-800 p-[6px] rounded-full"
    :class="{'opacity-50': isLoading}"
    @click="speak"
  />
</template>
