import { getGristApi } from "~/utils/grist"

type WordRecord = {
  manualSort: number
  Photos: number[]
  UpdatedAt: number
}

export default defineEventHandler(async () => {
  const grist = getGristApi()

  const words = await grist.fetchTable("Words")
  const photos = await grist.fetchTable("Photos")

  return words
    .map((record) => {
      const word = record as unknown as WordRecord

      const photoRefId = word.Photos?.[1]
      const photo = photos.find((photo) => photo.id === photoRefId)
      const attachmentId = (photo?.Photo as number[])?.[1]

      return {
        ...word,
        photoRefId,
        attachmentId,
      }
    })
    .sort((a, b) => b.UpdatedAt - a.UpdatedAt)
})
