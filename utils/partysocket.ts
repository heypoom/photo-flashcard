import PartySocket from "partysocket"

export const ws = new PartySocket({
  host: process.env.PARTYKIT_HOST || "localhost:1999",
  room: "my-room",
  id: "some-connection-id",
  party: "main",
  query: async () => ({
    appId: "flashcard-hunt-party",
  }),
})
