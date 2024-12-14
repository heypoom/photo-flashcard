import {GRIST_API_PREFIX, GRIST_DOC_ID} from '~/constants/grist'
import {predictWordAndMeaning} from '~/utils/google-ai'
import {getGristApi} from '~/utils/grist'

export default defineEventHandler(async (event) => {
  console.log('--- predicting')

  const grist = getGristApi()

  const formData = await readMultipartFormData(event)
  const photo = formData?.find((part) => part.name === 'photo')

  if (!photo?.data) {
    return {error: 'No photo provided'}
  }

  const prediction = await predictWordAndMeaning(photo.data)
  if (!prediction) {
    return {error: 'Image not recognized'}
  }

  console.log('--- predicted:', prediction)

  const attachmentFormData = new FormData()
  attachmentFormData.append('upload', new Blob([photo.data]))

  // upload
  const response = await fetch(`${GRIST_API_PREFIX}/attachments`, {
    method: 'POST',
    body: attachmentFormData,
    headers: {
      Authorization: `Bearer ${process.env.GRIST_API_KEY}`,
    },
  })

  const attachmentResponse: number[] = await response.json()
  console.log('attachment response:', attachmentResponse)

  await grist.addRecords('Words', [
    {
      Word: prediction.word,
      Meaning: prediction.meaning,
      Pronunciation: prediction.pronunciation,

      Photos: attachmentResponse[0],
    },
  ])

  return prediction
})
