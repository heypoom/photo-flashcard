<script lang="ts" setup>
import { Icon } from "@iconify/vue"
import { ref, onMounted, onBeforeUnmount, computed } from "vue"
import Compressor from "compressorjs"
import { PartySocket } from "partysocket"

const route = useRoute()
const albumId = route.params.albumId

const config = useRuntimeConfig()
const PARTYKIT_HOST = config.public.partykitHost
console.log("PARTYKIT_HOST", config.public)

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

// Add player state
const players = ref<Record<string, { score: number; emoji: string }>>({})
const clientId = ref<string>("")
const showLeaderboard = ref(false)

// Add computed properties for scores with null checks
const sortedPlayers = computed(() => {
  if (!players.value || !clientId.value) return []

  return Object.entries(players.value)
    .map(([id, data]) => ({
      id,
      ...data,
      isClient: id === clientId.value,
    }))
    .sort((a, b) => b.score - a.score)
})

const clientScore = computed(() => {
  if (!players.value || !clientId.value) return 0
  return players.value[clientId.value]?.score ?? 0
})

const clientEmoji = computed(() => {
  if (!players.value || !clientId.value) return "👾"
  return players.value[clientId.value]?.emoji ?? "👾"
})

onMounted(() => {
  // Connect to PartyKit server using PartySocket
  socket.value = new PartySocket({
    host: PARTYKIT_HOST,
    room: albumId as string,
  })

  socket.value.addEventListener("open", () => {
    console.log(`-- connecting to ${PARTYKIT_HOST}`)

    isConnecting.value = false
    clientId.value = socket.value?.id ?? ""
  })

  socket.value.addEventListener("message", (event) => {
    console.log("-- partykit message", event.data)

    try {
      const data = JSON.parse(event.data)

      if (data.type === "state") {
        currentWord.value = data.data.word
        playerCount.value = data.data.playerCount

        // Only update players if the data exists
        if (data.data.players) {
          players.value = data.data.players
        }

        // Request new word if none is present
        if (!data.data.word) {
          nextWord()
        }
      }
    } catch (error) {
      console.error("Error parsing message:", error)
    }
  })

  socket.value.addEventListener("close", () => {
    console.log("-- partykit socket closed")

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

async function handleCapture(file: File) {
  uploadingRef.value = true

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

  if (isCorrect && socket.value) {
    socket.value.send(JSON.stringify({ type: "correct" }))
  }

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

    <!-- Add score display -->
    <div
      class="fixed top-5 left-1/2 -translate-x-1/2 flex items-center gap-x-2 bg-slate-800 px-4 py-2 rounded-full cursor-pointer"
      @click="showLeaderboard = !showLeaderboard"
    >
      <span class="text-white text-lg">{{ clientEmoji }}</span>
      <span class="text-white text-lg font-bold">{{ clientScore }}</span>
    </div>

    <!-- Add leaderboard -->
    <div
      v-if="showLeaderboard"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-20"
      @click.self="showLeaderboard = false"
    >
      <div class="mx-4 bg-slate-800 rounded-xl p-6 w-full max-w-md">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-white text-2xl font-bold">Leaderboard</h2>
          <Icon
            icon="solar:close-circle-line-duotone"
            class="text-2xl text-white cursor-pointer"
            @click="showLeaderboard = false"
          />
        </div>

        <div class="space-y-2">
          <div
            v-for="player in sortedPlayers"
            :key="player.id"
            class="flex items-center justify-between p-3 rounded-lg"
            :class="player.isClient ? 'bg-pink-500/20' : 'bg-slate-700'"
          >
            <div class="flex items-center gap-x-2">
              <span class="text-xl">{{ player.emoji }}</span>
              <span class="text-white">{{
                player.isClient ? "You" : `Player ${player.id.slice(0, 4)}`
              }}</span>
            </div>
            <span class="text-white font-bold">{{ player.score }}</span>
          </div>
        </div>
      </div>
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
      <div class="w-full flex justify-center items-end gap-x-3">
        <CameraCapture
          @capture="handleCapture"
          :uploading="uploadingRef"
          :is-correct="isCorrectRef"
        />

        <SpeakButton
          v-if="currentWord"
          :word="currentWord.word"
          :language="currentWord.language"
          class="!bg-blue-500 size-[45px]"
        />

        <DrawingButton @finish="handleCapture" />

        <Icon
          icon="solar:refresh-broken"
          class="text-[45px] size-[45px] p-[6px] text-white bg-slate-500 hover:bg-slate-700 rounded-full cursor-pointer"
          @click="nextWord"
        />
      </div>
    </div>

    <div class="fixed top-5 left-5" v-if="!isFullscreenWidgetOpen">
      <NuxtLink :to="`/albums/${albumId}`">
        <Icon
          icon="solar:arrow-left-linear"
          class="text-4xl text-white bg-slate-600 hover:bg-slate-700 p-1 rounded-full cursor-pointer"
        />
      </NuxtLink>
    </div>
  </div>

  <ConfettiEffect v-if="isCorrectRef === true" />
</template>
