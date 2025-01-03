import type * as Party from "partykit/server"

const API_PREFIX = process.env.API_PREFIX ?? "https://flashcard.poom.dev"

interface RoomState {
  currentWord?: {
    word: string
    pronunciation: string
    meaning: string
    language: string
  }
  words: Array<{
    word: string
    pronunciation: string
    meaning: string
    language: string
  }>
  playerCount: number
}

export default class Server implements Party.Server {
  constructor(readonly room: Party.Room) {}

  async onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    console.log(
      `Connected:
  id: ${conn.id}
  room: ${this.room.id}
  url: ${new URL(ctx.request.url).pathname}`,
    )

    // Get or initialize room state
    const state = (await this.room.storage.get<RoomState>("state")) || {
      words: [],
      currentWord: undefined,
      playerCount: 0,
    }

    // Increment player count
    state.playerCount++
    await this.room.storage.put("state", state)

    // Broadcast updated player count
    this.room.broadcast(
      JSON.stringify({
        type: "players",
        data: state.playerCount,
      }),
    )

    // If no words loaded yet, fetch them from the API
    if (state.words.length === 0) {
      const albumId = this.room.id
      const response = await fetch(`${API_PREFIX}/api/words/${albumId}`)
      const words = await response.json()

      state.words = words.map((w: any) => ({
        word: w.Word,
        pronunciation: w.Pronunciation || "",
        meaning: w.Meaning || "",
        language: w.Language,
      }))

      // Pick initial random word if none exists
      if (!state.currentWord && state.words.length > 0) {
        const randomIndex = Math.floor(Math.random() * state.words.length)
        state.currentWord = state.words[randomIndex]
      }

      await this.room.storage.put("state", state)
    }

    // Send current state to the new connection
    conn.send(
      JSON.stringify({
        type: "state",
        data: {
          word: state.currentWord,
          playerCount: state.playerCount,
        },
      }),
    )
  }

  async onMessage(message: string, sender: Party.Connection) {
    try {
      const data = JSON.parse(message)

      if (data.type === "next") {
        const state = await this.room.storage.get<RoomState>("state")
        if (!state || state.words.length === 0) return

        // Pick a random word
        const randomIndex = Math.floor(Math.random() * state.words.length)
        state.currentWord = state.words[randomIndex]

        // Save state
        await this.room.storage.put("state", state)

        // Broadcast new word to all connections
        this.room.broadcast(
          JSON.stringify({
            type: "state",
            data: {
              word: state.currentWord,
              playerCount: state.playerCount,
            },
          }),
        )
      }
    } catch (error) {
      console.error("Error processing message:", error)
    }
  }

  async onClose(conn: Party.Connection) {
    // Get current state
    const state = await this.room.storage.get<RoomState>("state")
    if (!state) return

    // Decrement player count
    state.playerCount = Math.max(0, state.playerCount - 1)
    await this.room.storage.put("state", state)

    // Broadcast updated player count
    this.room.broadcast(
      JSON.stringify({
        type: "players",
        data: state.playerCount,
      }),
    )
  }
}

Server satisfies Party.Worker
