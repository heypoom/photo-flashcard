import { nanoid } from "nanoid"
import sharp from "sharp"

import { GRIST_API_PREFIX } from "~/constants/grist"
import { Language } from "~/types/language"
import { Prediction } from "~/types/prediction"
import { getGristApi } from "~/utils/grist"
import { predictWordAndMeaning } from "~/utils/predict-word"

export default defineEventHandler(async (event) => {
  console.log("--- predicting")

  const grist = getGristApi()

  const formData = await readMultipartFormData(event)
  const photo = formData?.find((part) => part.name === "photo")
  const albumId = formData?.find((part) => part.name === "albumId")

  const languages = JSON.parse(
    String(formData?.find((part) => part.name === "languages")?.data),
  ) as Language[]

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
          languages,
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

        const [attachmentId]: number[] = await response.json()
        console.log("--- /api/predict-from-photo: attachment id:", attachmentId)

        const [photoRecordId] = await grist.addRecords("Photos", [
          { Photo: ["L", attachmentId] },
        ])

        console.log("--- /api/predict-from-photo: photo record:", photoRecordId)

        resolve(photoRecordId)
      }),
    ])
  } catch (err) {
    if (err && typeof err == "object" && "error" in err) {
      return err
    }
  }

  const [predictions, photoRecordId] = results as [Prediction[], number]

  // To know which word are the same across languages, we create a shared key.
  // This is used for multi-language albums for challenge mode.
  const key = nanoid()

  // Add records for each languages specified
  const records = predictions.map((prediction) => ({
    Word: prediction.word,
    Meaning: prediction.meaning,
    Pronunciation: prediction.pronunciation,
    Photos: ["L", photoRecordId] as ["L", number],
    Album: Number(albumId.data),
    Language: String(prediction.language),
    Key: key,
  }))

  await grist.addRecords("Words", records)

  return predictions.filter((p) => languages.includes(p.language))
})
