import { getGristApi } from "~/utils/grist"
import { gristSql } from "~/utils/grist-sql"

export default defineEventHandler(async (event) => {
  const grist = getGristApi()

  if (event.method === "GET") {
    const start = Date.now()

    const albums = await gristSql(`
      SELECT 
        Albums.id,
        Albums.Name as name,
        COUNT(Words.id) as wordCount
      FROM Albums
      FULL JOIN Words ON Words.AlbumId = Albums.id
      GROUP BY Albums.id, Albums.Name
    `)

    console.log(`--- GET /api/albums took ${Date.now() - start}ms`)

    return albums
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
      { Name: name, CreatedAt: Date.now(), Languages: ["cn"] },
    ])

    return {
      id: albumId,
      name,
      wordCount: 0,
    }
  }
})
