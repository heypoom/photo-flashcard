<script lang="ts" setup>
  import { ref } from 'vue'
  import Compressor from "compressorjs"
  import {Icon} from '@iconify/vue'

  const props = defineProps<{
    onSuccess?: () => void
  }>()

  const fileNameRef = ref('')
  const uploadingRef = ref(false)

  const compress = (file: File) => new Promise<File | Blob>(resolve => {
    new Compressor(file, {
      quality: 0.8,
      width: 500,
      height: 500,
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
  <div class="flex justify-center w-full fixed bottom-5">
    <div class="flex">
      <input id="file-upload" type="file" v-on:change="uploadAndPredict" class="hidden" :disabled="uploadingRef" />

      <label for="file-upload">
        <div class="bg-red-500 text-white p-3 rounded-full shadow-xl cursor-pointer" :class="{ 'opacity-30 animate-spin': uploadingRef }">
          <Icon :icon="uploadingRef ? 'solar:clock-circle-outline' : 'solar:camera-bold'" class="text-3xl" />
        </div>
      </label>
    </div>
  </div>
</template>