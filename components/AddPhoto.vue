<script lang="ts" setup>
import { ref } from "vue"
import Compressor from "compressorjs"
import { Icon } from "@iconify/vue"
import type { Language } from "~/types/language"

const emit = defineEmits<{
  (e: "success"): void
}>()

const props = defineProps<{
  albumId: string | number
  languages: Language[]
}>()

const uploadingRef = ref(false)

const compress = (file: File) =>
  new Promise<File | Blob>((resolve) => {
    new Compressor(file, {
      quality: 0.8,
      width: 500,
      height: 500,
      success: resolve,
      resize: "cover",
    })
  })

async function handleCapture(file: File) {
  uploadingRef.value = true

  const compressedFile = await compress(file)

  const formData = new FormData()
  formData.append("photo", compressedFile)
  formData.append("albumId", props.albumId.toString())
  formData.append("languages", JSON.stringify(props.languages))

  console.log("--- predicting")

  const response = await fetch("/api/predict-from-photo", {
    method: "POST",
    body: formData,
  })

  console.log("response:", await response.text())

  emit("success")
  uploadingRef.value = false
}
</script>

<template>
  <div class="flex relative">
    <CameraCapture
      @capture="handleCapture"
      :uploading="uploadingRef"
      :is-correct="null"
    />
  </div>
</template>
