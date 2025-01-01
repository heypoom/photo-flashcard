<script lang="ts" setup>
  import {Icon} from '@iconify/vue'

  import {speak} from "../utils/synthesis"

  const props = defineProps<{
    word?: string
  }>()
</script>

<template>
  <Icon
    icon="solar:user-speak-bold"
    class="text-3xl cursor-pointer text-white bg-gray-700 hover:bg-gray-800 p-[6px] rounded-full"
    @click="() => { props.word && speak({message: props.word}) }"
  />
</template>
