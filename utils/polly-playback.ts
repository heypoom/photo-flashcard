import type { StreamingBlobPayloadOutputTypes } from "@smithy/types"

export async function playbackPollyAudioStream(
  audioStream: StreamingBlobPayloadOutputTypes,
) {
  const hasMSE =
    "MediaSource" in window && MediaSource.isTypeSupported("audio/mpeg")

  // Fallback for browsers without MediaSource support
  if (!hasMSE) {
    const now = Date.now()
    const byteArray = await audioStream.transformToByteArray()
    console.log(`--- convert audio to byte array in: ${Date.now() - now}ms`)

    const blob = new Blob([byteArray], { type: "audio/mpeg" })

    const url = URL.createObjectURL(blob)
    const audio = new Audio(url)

    audio.onended = () => {
      URL.revokeObjectURL(url)
      audio.src = ""
    }

    await audio.play()

    return
  }

  const mediaSource = new MediaSource()
  const stream = audioStream.transformToWebStream()
  const audio = new Audio(URL.createObjectURL(mediaSource))

  mediaSource.addEventListener("sourceopen", async () => {
    const sourceBuffer = mediaSource.addSourceBuffer("audio/mpeg")
    const reader = stream.getReader()

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        // Wait for any pending updates to complete
        if (sourceBuffer.updating) {
          await new Promise((resolve) => {
            sourceBuffer.addEventListener("updateend", resolve, {
              once: true,
            })
          })
        }

        sourceBuffer.appendBuffer(value)
      }

      // Wait for final update to complete before ending stream
      if (sourceBuffer.updating) {
        await new Promise((resolve) => {
          sourceBuffer.addEventListener("updateend", resolve, { once: true })
        })
      }
      mediaSource.endOfStream()
    } catch (err) {
      console.error("error streaming audio:", err)
      mediaSource.endOfStream("decode")
    }
  })

  audio.oncanplaythrough = () => audio.play()

  audio.onended = () => {
    URL.revokeObjectURL(audio.src)
    audio.src = ""
  }
}
