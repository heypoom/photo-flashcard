import { verifyWordChallenge } from "~/utils/verify-word-challenge"

export default defineEventHandler(async (event) => {
  console.log("--- verifying word at /api/verify/word")

  const formData = await readMultipartFormData(event)
  const photo = formData?.find((part) => part.name === "photo")
  const word = formData?.find((part) => part.name === "word")

  if (!photo?.data) {
    return { error: "No photo provided" }
  }

  try {
    const isCorrect = await verifyWordChallenge(
      photo?.data,
      word?.data?.toString() ?? "",
    )

    return { isCorrect }
  } catch (err) {
    return err
  }
})
