import { Language } from "~/types/language"
import { getGristApi } from "~/utils/grist"

type WordRecord = {
  manualSort: number
  Photos: number[]
  UpdatedAt: number
  Album: number
  Language: Language
}

type PhotoRecord = {
  id: number
  Photo: number[]
}

export default defineEventHandler(async (event) => {
  const start = Date.now()
  const grist = getGristApi()
  const albumId = getRouterParam(event, "albumId")
  const filter = { Album: [Number(albumId)] }

  const [words, photos] = await Promise.all([
    grist.fetchTable("Words", filter),
    grist.fetchTable("Photos", filter),
  ])

  console.log(`[/api/words/${albumId}] took ${Date.now() - start}ms`)

  return words
    .map((record) => {
      const word = record as unknown as WordRecord
      const photoRefId = word.Photos?.[1]
      const photo = photos.find((photo) => photo.id === photoRefId)
      const attachmentId = (photo?.Photo as number[])?.[1]

      return {
        ...word,
        photo,
        photoRefId,
        attachmentId,
      }
    })
    .sort((a, b) => b.UpdatedAt - a.UpdatedAt)
})
