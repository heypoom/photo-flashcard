import type * as Party from "partykit/server"

const API_PREFIX = process.env.API_PREFIX ?? "https://flashcard.poom.dev"

interface RoomState {
  currentWord?: {
    word: string
    pronunciation: string
    meaning: string
    language: string
  }
  playerCount: number
  players: Record<
    string,
    {
      score: number
      emoji: string
    }
  >
}

const EMOJIS = [
  "🐶",
  "🐱",
  "🐭",
  "🐹",
  "🐰",
  "🦊",
  "🐻",
  "🐼",
  "🐨",
  "🐯",
  "🦁",
  "🐮",
  "🐷",
  "🐸",
  "🐙",
  "🦄",
]

export const getRandomWord = async (albumId: string) => {
  const response = await fetch(`${API_PREFIX}/api/challenge/${albumId}`)
  const data = await response.json()

  return {
    word: data.Word,
    pronunciation: data.Pronunciation,
    meaning: data.Meaning,
    language: data.Language,
  }
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
      currentWord: undefined,
      playerCount: 0,
      players: {},
    }

    // Initialize player if not exists
    if (!state.players) {
      state.players = {}
    }

    if (!state.players[conn.id]) {
      state.players[conn.id] = {
        score: 0,
        emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
      }
    }

    if (!state.currentWord) {
      state.currentWord = await getRandomWord(this.room.id)
    }

    // Ensure playerCount is valid
    state.playerCount = Math.max(1, Object.keys(state.players).length)
    await this.room.storage.put("state", state)

    // Broadcast updated state
    this.room.broadcast(
      JSON.stringify({
        type: "state",
        data: {
          word: state.currentWord,
          playerCount: state.playerCount,
          players: state.players,
        },
      }),
    )

    // Send current state to the new connection
    conn.send(
      JSON.stringify({
        type: "state",
        data: {
          word: state.currentWord,
          playerCount: state.playerCount,
          players: state.players,
        },
      }),
    )
  }

  async onMessage(message: string, sender: Party.Connection) {
    try {
      const data = JSON.parse(message)

      if (data.type === "next") {
        const state = await this.room.storage.get<RoomState>("state")
        if (!state) {
          console.error("Invalid state or no words available")
          return
        }

        state.currentWord = await getRandomWord(this.room.id)

        // Ensure players object exists
        if (!state.players) {
          state.players = {}
        }

        // Save state
        await this.room.storage.put("state", state)

        // Broadcast new word to all connections
        this.room.broadcast(
          JSON.stringify({
            type: "state",
            data: {
              word: state.currentWord,
              playerCount: state.playerCount,
              players: state.players,
            },
          }),
        )
      } else if (data.type === "correct") {
        const state = await this.room.storage.get<RoomState>("state")
        if (!state) {
          console.error("No state found")
          return
        }

        // Ensure players object exists
        if (!state.players) {
          state.players = {}
        }

        // Increment player score
        if (state.players[sender.id]) {
          state.players[sender.id].score += 1
          await this.room.storage.put("state", state)

          // Broadcast updated scores
          this.room.broadcast(
            JSON.stringify({
              type: "state",
              data: {
                word: state.currentWord,
                playerCount: state.playerCount,
                players: state.players,
              },
            }),
          )
        }
      }
    } catch (error) {
      console.error("Error processing message:", error)
    }
  }

  async onClose(conn: Party.Connection) {
    // Get current state
    const state = await this.room.storage.get<RoomState>("state")
    if (!state) {
      console.error("No state found during close")
      return
    }

    // Ensure players object exists
    if (!state.players) {
      state.players = {}
    }

    // Decrement player count and ensure it's not negative
    state.playerCount = Math.max(0, Object.keys(state.players).length - 1)

    // Remove player from players list
    delete state.players[conn.id]

    await this.room.storage.put("state", state)

    // Broadcast updated state
    this.room.broadcast(
      JSON.stringify({
        type: "state",
        data: {
          word: state.currentWord,
          playerCount: state.playerCount,
          players: state.players,
        },
      }),
    )
  }
}

Server satisfies Party.Worker
