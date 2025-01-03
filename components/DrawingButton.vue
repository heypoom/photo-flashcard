<script lang="ts" setup>
import { Icon } from "@iconify/vue"

const emit = defineEmits<{
  (e: "finish", file: File): void
}>()

const toggleDrawingCanvas = () => {
  isDrawingCanvasOpen.value = !isDrawingCanvasOpen.value
}

const toggleDrawingIcon = computed(() => {
  return isDrawingCanvasOpen.value ? "mdi:multiply" : "solar:pen-broken"
})

async function submitDrawing() {
  const base64Response = await fetch(drawingCanvasImage.value)
  const blob = await base64Response.blob()
  const file = new File([blob], "drawing.png", { type: "image/png" })

  emit("finish", file)

  drawingCanvasImage.value = ""
  isDrawingCanvasOpen.value = false
}
</script>

<template>
  <div
    class="fixed top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] z-0"
    v-if="isDrawingCanvasOpen"
  >
    <DrawingCanvas />
  </div>

  <button
    v-if="isDrawingCanvasOpen"
    class="bg-green-600 size-[45px] rounded-full cursor-pointer flex items-center justify-center z-20"
    @click="submitDrawing"
  >
    <Icon icon="solar:gallery-send-outline" class="text-white text-[24px]" />
  </button>

  <button
    class="bg-slate-500 size-[45px] rounded-full cursor-pointer flex items-center justify-center z-20"
    @click="toggleDrawingCanvas"
  >
    <Icon :icon="toggleDrawingIcon" class="text-white text-[24px]" />
  </button>
</template>
