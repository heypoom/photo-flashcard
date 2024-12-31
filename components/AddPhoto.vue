<script lang="ts" setup>
  import { ref } from 'vue'
  import Compressor from "compressorjs"

  const props = defineProps<{
    onSuccess?: () => void
  }>()

  const fileNameRef = ref('')
  const uploadingRef = ref(false)

  const compress = (file: File) => new Promise<File | Blob>(resolve => {
    new Compressor(file, {
      quality: 0.8,
      maxWidth: 500,
      maxHeight: 500,
      success: resolve,
      resize: "cover"
    })
  })

  async function uploadAndPredict(event: Event) {
    uploadingRef.value = true
    const target = event.target as HTMLInputElement

    const file = target.files?.[0]

    if (!file) {
      return
    }

    const compressedFile = await compress(file)

    const formData = new FormData()
    formData.append('photo', compressedFile)

    console.log('--- predicting')

    const response = await fetch('/api/predict-from-photo', {
      method: 'POST',
      body: formData
    })

    console.log('response:', await response.text())

    fileNameRef.value = file.name

    props.onSuccess?.()
    uploadingRef.value = false
  }
</script>

<template>
  <div class="flex justify-between w-full">
    <input type="file" v-on:change="uploadAndPredict" class="text-white" />
    
    <div v-if="uploadingRef">Uploading...</div>
    <div v-if="fileNameRef">Uploaded {{ fileNameRef }}</div>
  </div>
</template>