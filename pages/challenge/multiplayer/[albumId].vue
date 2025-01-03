<script lang="ts" setup>
import { Icon } from "@iconify/vue"
import { ref, onMounted, onBeforeUnmount } from "vue"
import Compressor from "compressorjs"
import { PartySocket } from "partysocket"

const route = useRoute()
const albumId = route.params.albumId

const PARTYKIT_HOST =
  process.env.PARTYKIT_HOST ??
  "https://flashcard-hunt-party.heypoom.partykit.dev"

// PartyKit WebSocket connection
const socket = ref<PartySocket | null>(null)
const isConnecting = ref(true)
const playerCount = ref(0)
const currentWord = ref<{
  word: string
  pronunciation: string
  meaning: string
  language: string
} | null>(null)

const uploadingRef = ref(false)
const isCorrectRef = ref<boolean | null>(null)

onMounted(() => {
  // Connect to PartyKit server using PartySocket
  socket.value = new PartySocket({
    host: PARTYKIT_HOST,
    room: albumId as string,
  })

  socket.value.addEventListener("open", () => {
    isConnecting.value = false
  })

  socket.value.addEventListener("message", (event) => {
    try {
      const data = JSON.parse(event.data)
      if (data.type === "state") {
        currentWord.value = data.data.word
        playerCount.value = data.data.playerCount
      } else if (data.type === "players") {
        playerCount.value = data.data
      }
    } catch (error) {
      console.error("Error parsing message:", error)
    }
  })

  socket.value.addEventListener("close", () => {
    isConnecting.value = true
  })
})

onBeforeUnmount(() => {
  socket.value?.close()
})

const compress = (file: File) =>
  new Promise<File | Blob>((resolve) => {
    new Compressor(file, {
      quality: 0.2,
      width: 500,
      height: 500,
      success: resolve,
      resize: "cover",
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

  const entry = currentWord.value
  const targetWord = `${entry?.word ?? ""} (meaning: ${entry?.meaning})`

  const formData = new FormData()
  formData.append("photo", compressedFile)
  formData.append("word", targetWord)

  console.log("--- verifying")

  const response = await fetch("/api/verify/word", {
    method: "POST",
    body: formData,
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

function nextWord() {
  if (!socket.value) return
  socket.value.send(JSON.stringify({ type: "next" }))
}

const uploadIconClass = computed(() => {
  if (uploadingRef.value) {
    return "bg-yellow-500 animate-pulse"
  }
  if (isCorrectRef.value === true) {
    return "bg-green-500"
  }
  if (isCorrectRef.value === false) {
    return "bg-red-500"
  }
  return "bg-pink-500 hover:bg-pink-700"
})

const uploadIcon = computed(() => {
  if (uploadingRef.value) {
    return "solar:hourglass-line-duotone"
  }
  if (isCorrectRef.value === true) {
    return "solar:check-circle-line-duotone"
  }
  if (isCorrectRef.value === false) {
    return "solar:close-circle-line-duotone"
  }
  return "solar:camera-minimalistic-line-duotone"
})
</script>

<template>
  <div
    class="bg-slate-950 min-h-screen flex flex-col justify-center px-8 items-center"
  >
    <div
      v-if="isConnecting"
      class="w-full flex items-center justify-center pb-5 min-h-screen fixed left-0 top-0 pointer-events-none z-10"
    >
      <Icon
        icon="solar:refresh-broken"
        class="animate-spin text-6xl text-white"
      />
    </div>

    <div class="fixed top-5 right-5 flex items-center gap-x-2">
      <Icon
        icon="solar:users-group-rounded-line-duotone"
        class="text-2xl text-white"
      />
      <span class="text-white text-lg">{{ playerCount }}</span>
    </div>

    <section v-if="currentWord">
      <div class="p-4">
        <div class="text-white text-4xl font-bold mb-2">
          {{ currentWord.word }}
        </div>
        <div class="text-white text-2xl">{{ currentWord.pronunciation }}</div>
      </div>
    </section>

    <div class="fixed bottom-5">
      <div class="w-full flex justify-center gap-x-3">
        <div class="flex">
          <input
            id="file-upload"
            type="file"
            v-on:change="uploadAndVerifyWordChallenge"
            class="hidden"
            :disabled="uploadingRef"
          />

          <label for="file-upload">
            <div
              class="text-white p-2 rounded-full shadow-xl cursor-pointer"
              :class="uploadIconClass"
            >
              <Icon :icon="uploadIcon" class="text-3xl" />
            </div>
          </label>
        </div>

        <SpeakButton
          v-if="currentWord"
          :word="currentWord.word"
          :language="currentWord.language"
          class="!bg-blue-500 size-[45px]"
        />

        <Icon
          icon="solar:refresh-broken"
          class="text-[45px] size-[45px] p-[6px] text-white bg-slate-500 hover:bg-slate-700 rounded-full cursor-pointer"
          @click="nextWord"
        />
      </div>
    </div>

    <div class="fixed top-5 left-5">
      <NuxtLink :to="`/albums/${albumId}`">
        <Icon
          icon="solar:arrow-left-linear"
          class="text-4xl text-white bg-slate-600 hover:bg-slate-700 p-1 rounded-full cursor-pointer"
        />
      </NuxtLink>
    </div>
  </div>
</template>
