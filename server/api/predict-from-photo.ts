import sharp from "sharp"

import { GRIST_API_PREFIX } from "~/constants/grist"
import { Language } from "~/types/language"
import { getGristApi } from "~/utils/grist"
import { predictWordAndMeaning } from "~/utils/predict-word"

export default defineEventHandler(async (event) => {
  console.log("--- predicting")

  const grist = getGristApi()

  const formData = await readMultipartFormData(event)
  const photo = formData?.find((part) => part.name === "photo")
  const albumId = formData?.find((part) => part.name === "albumId")

  const language = String(
    formData?.find((part) => part.name === "language")?.data,
  ) as Language

  if (!photo?.data) {
    return { error: "No photo provided" }
  }

  if (!albumId?.data) {
    return { error: "No album ID provided" }
  }

  let results: [unknown, unknown] = [null, null]

  try {
    results = await Promise.all([
      new Promise(async (resolve, reject) => {
        let sharpImage = sharp(photo.data)

        const metadata = await sharpImage.metadata()

        const { width, height } = metadata

        if (width && height) {
          sharpImage = sharpImage.resize(
            Math.round(width * 0.5),
            Math.round(height * 0.5),
          )
        }

        const downscaledBuffer = await sharpImage
          .jpeg({ quality: 50 })
          .toBuffer()

        console.log(
          `--- resized! buffer is ${downscaledBuffer.length} bytes ---`,
        )

        const prediction = await predictWordAndMeaning(
          downscaledBuffer,
          language,
        )

        if (!prediction) {
          return reject({ error: "Image not recognized" })
        }

        console.log("--- predicted:", prediction)

        resolve(prediction)
      }),

      new Promise(async (resolve) => {
        const attachmentFormData = new FormData()
        attachmentFormData.append("upload", new Blob([photo.data]))

        // upload image to Grist attachments
        const response = await fetch(`${GRIST_API_PREFIX}/attachments`, {
          method: "POST",
          body: attachmentFormData,
          headers: {
            Authorization: `Bearer ${process.env.GRIST_API_KEY}`,
          },
        })

        const attachmentResponse: number[] = await response.json()
        console.log("--- attachment response:", attachmentResponse)

        const [photoRecordId] = await grist.addRecords("Photos", [
          { Photo: attachmentResponse[0] },
        ])

        resolve(photoRecordId)
      }),
    ])
  } catch (err) {
    if (err && typeof err == "object" && "error" in err) {
      return err
    }
  }

  const [prediction, photoRecordId] = results as [
    { word: string; meaning: string; pronunciation: string },
    number,
  ]

  await grist.addRecords("Words", [
    {
      Word: prediction.word,
      Meaning: prediction.meaning,
      Pronunciation: prediction.pronunciation,
      Photos: ["L", photoRecordId],
      Album: Number(albumId.data),
      Language: language,
    },
  ])

  return prediction
})
