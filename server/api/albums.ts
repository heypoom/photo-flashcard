import { getGristApi } from "~/utils/grist"

export default defineEventHandler(async (event) => {
  const grist = getGristApi()

  if (event.method === "GET") {
    const albums = await grist.fetchTable("Albums")
    const words = await grist.fetchTable("Words")

    return albums.map((album) => ({
      id: album.id,
      name: album.Name,
      wordCount: words.filter((word) => word.Albums === album.id).length,
    }))
  }

  if (event.method === "POST") {
    const body = await readBody(event)
    const { name } = body

    if (!name) {
      throw createError({
        statusCode: 400,
        message: "Album name is required",
      })
    }

    const [albumId] = await grist.addRecords("Albums", [
      {
        Name: name,
        CreatedAt: Date.now(),
      },
    ])

    return {
      id: albumId,
      name,
      wordCount: 0,
    }
  }
})
