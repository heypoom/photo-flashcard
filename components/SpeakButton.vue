<script lang="ts" setup>
  import {Icon} from '@iconify/vue'

  import {speak} from "../utils/synthesis"
  import {speakWithPolly} from "../utils/polly"

  const props = defineProps<{
    word?: string
  }>()
</script>

<template>
  <Icon
    icon="solar:user-speak-bold"
    class="text-[33px] cursor-pointer text-white bg-gray-700 hover:bg-gray-800 p-[6px] rounded-full"
    @click="() => { props.word && speakWithPolly(props.word) }"
  />
</template>
