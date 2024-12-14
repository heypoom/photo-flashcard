import {getGristApi} from '~/utils/grist'

export default defineEventHandler(async () => {
  const words = await getGristApi().fetchTable('Words')

  return words.map((word) => ({
    ...word,
    attachmentId: (word.Photos as number[])?.[1],
  }))
})
