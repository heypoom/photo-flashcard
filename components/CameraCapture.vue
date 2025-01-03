<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from "vue"
import { Icon } from "@iconify/vue"

const emit = defineEmits<{
  (e: "capture", file: File): void
}>()

const { uploading, isCorrect, buttonGroupClass } = defineProps<{
  uploading: boolean
  isCorrect?: boolean | null
  buttonGroupClass?: string
}>()

const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

const videoRef = ref<HTMLVideoElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const stream = ref<MediaStream | null>(null)

const errorMessage = ref("")

const uploadIconClass = computed(() => {
  if (uploading) return "bg-yellow-500 animate-pulse"
  if (isCorrect === true) return "bg-green-500"
  if (isCorrect === false) return "bg-red-500"

  if (!useNativeFilePicker.value && !isCameraActive.value) {
    return "bg-indigo-500 hover:bg-indigo-700"
  }

  return "bg-pink-500"
})

const uploadIcon = computed(() => {
  if (uploading) return "solar:hourglass-line-duotone"
  if (isCorrect === true) return "solar:check-circle-line-duotone"
  if (isCorrect === false) return "solar:close-circle-line-duotone"

  return "solar:camera-outline"
})

async function startCamera(): Promise<boolean> {
  console.log("-- starting camera")

  try {
    errorMessage.value = ""
    if (stream.value) {
      stream.value.getTracks().forEach((track) => track.stop())
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      errorMessage.value = "Camera access is not supported in your browser"
      return false
    }

    const constraints = { video: { facingMode: "environment" } }

    stream.value = await navigator.mediaDevices.getUserMedia(constraints)

    if (videoRef.value) {
      videoRef.value.srcObject = stream.value
      isCameraActive.value = true
    }
  } catch (error) {
    console.error("Error accessing camera:", error)

    if (error instanceof Error) {
      if (error.name === "NotAllowedError") {
        errorMessage.value =
          "Camera permission was denied. Using the gallery photo picker. Please allow camera access and try again."
      } else if (error.name === "NotFoundError") {
        errorMessage.value = "No camera device was found"
      } else {
        errorMessage.value = "Error accessing camera: " + error.message
      }
    }

    isCameraActive.value = false
  }

  return isCameraActive.value
}

function stopCamera() {
  if (stream.value) {
    stream.value.getTracks().forEach((track) => track.stop())
    stream.value = null
    isCameraActive.value = false
  }
}

async function capturePhoto() {
  if (!videoRef.value || !canvasRef.value) return

  if (!isCameraActive.value) {
    const isStarted = await startCamera()

    // Fallback to the native file picker if the camera is not available
    if (!isStarted) {
      useNativeFilePicker.value = true
    }

    return
  }

  const video = videoRef.value
  const canvas = canvasRef.value
  const context = canvas.getContext("2d")

  if (!context) return

  // Set canvas dimensions to match video
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight

  // Draw the video frame to canvas
  context.drawImage(video, 0, 0, canvas.width, canvas.height)

  // Convert canvas to blob
  canvas.toBlob(
    (blob) => {
      if (!blob) return

      const file = new File([blob], "camera-capture.jpg", {
        type: "image/jpeg",
      })
      emit("capture", file)
      isCameraActive.value = false
    },
    "image/jpeg",
    0.8,
  )
}

function handleFilePicker(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file) {
    emit("capture", file)
    isCameraActive.value = false
  }
}

onMounted(() => {
  // Camera will be started by button click instead of automatically
})

onUnmounted(() => {
  stopCamera()
})
</script>

<template>
  <!-- Error Message -->
  <div
    v-if="errorMessage"
    class="fixed top-20 mx-5 left-0 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4"
    @click="errorMessage = ''"
  >
    <p>{{ errorMessage }}</p>
  </div>

  <div
    v-if="!useNativeFilePicker"
    class="text-white p-2 rounded-full shadow-xl cursor-pointer z-30"
    :class="uploadIconClass"
    @click="capturePhoto"
  >
    <Icon :icon="uploadIcon" class="text-3xl" />
  </div>

  <div v-if="useNativeFilePicker && !isDrawingCanvasOpen" class="flex gap-x-3">
    <input
      type="file"
      accept="image/*"
      @change="handleFilePicker"
      class="hidden"
      id="camera-picker"
      capture="environment"
    />

    <label for="camera-picker">
      <div
        class="text-white p-2 rounded-full shadow-xl cursor-pointer"
        :class="uploadIconClass"
      >
        <Icon :icon="uploadIcon" class="text-3xl" />
      </div>
    </label>

    <!-- Select File From Gallery -->
    <div v-if="isMobile">
      <input
        type="file"
        accept="image/*"
        @change="handleFilePicker"
        class="hidden"
        id="file-picker"
      />

      <label for="file-picker">
        <div
          class="text-white p-2 rounded-full shadow-xl cursor-pointer bg-slate-500 size-[45px] flex items-center justify-center"
        >
          <Icon icon="solar:gallery-linear" class="text-[24px]" />
        </div>
      </label>
    </div>
  </div>

  <div
    class="flex absolute gap-x-3 z-50 pt-1 left-16"
    :class="buttonGroupClass"
    v-if="!useNativeFilePicker && isCameraActive"
  >
    <!-- Stop Camera Button -->
    <button
      @click="stopCamera"
      class="size-[40px] bg-slate-500 hover:bg-slate-700 p-2 rounded-full shadow-xl"
    >
      <Icon icon="mdi:multiply" class="text-2xl text-white" />
    </button>
  </div>

  <!-- Camera Preview -->
  <div class="fixed top-0 left-0 z-10 bg-black">
    <div class="rounded-lg overflow-hidden">
      <video
        ref="videoRef"
        autoplay
        playsinline
        class="rounded-lg w-screen h-screen"
        :class="{ hidden: !isCameraActive }"
      ></video>
    </div>
  </div>

  <canvas ref="canvasRef" class="hidden"></canvas>
</template>
