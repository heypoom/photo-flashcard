import { getGristApi } from "~/utils/grist"
import { gristSql } from "~/utils/grist-sql"
import { Language } from "~/types/language"

export default defineEventHandler(async (event) => {
  const grist = getGristApi()

  if (event.method === "GET") {
    const start = Date.now()

    const albums = await gristSql(`
      SELECT 
        Albums.id,
        Albums.Name as name,
        Albums.Languages as languages,
        COUNT(Words.id) as wordCount
      FROM Albums
      FULL JOIN Words ON Words.AlbumId = Albums.id
      GROUP BY Albums.id, Albums.Name, Albums.Languages
    `)

    console.log(`--- GET /api/albums took ${Date.now() - start}ms`)

    return albums.map((album) => ({
      ...album,
      languages: JSON.parse(album.languages as string),
    }))
  }

  if (event.method === "POST") {
    const body = await readBody(event)
    const { name, languages } = body as { name: string; languages: Language[] }

    if (!name) {
      throw createError({
        statusCode: 400,
        message: "Album name is required",
      })
    }

    if (!languages || !Array.isArray(languages) || languages.length === 0) {
      throw createError({
        statusCode: 400,
        message: "At least one language must be selected",
      })
    }

    const [albumId] = await grist.addRecords("Albums", [
      { Name: name, Languages: ["L", ...languages] },
    ])

    return {
      id: albumId,
      name,
      languages,
      wordCount: 0,
    }
  }
})
