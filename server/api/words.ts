import {getGristApi} from '~/utils/grist'

export default defineEventHandler(async () => {
  const grist = getGristApi()

  const words = await grist.fetchTable('Words')
  const photos = await grist.fetchTable('Photos')

  return words.map((word) => {
    const photoRefId = (word.Photos as number[])?.[1]
    const photo = photos.find((photo) => photo.id === photoRefId)
    const attachmentId = (photo?.Photo as number[])?.[1]

    return {
      ...word,
      photoRefId,
      attachmentId,
    }
  })
})
