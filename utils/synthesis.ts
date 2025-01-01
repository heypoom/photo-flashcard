const DEFAULT_VOICE_URL = 'Li-Mu'

export function speak({
  message,
  voiceURI = DEFAULT_VOICE_URL,
  pitch,
  rate,
}: {
  message: string
  voiceURI?: string
  pitch?: number
  rate?: number
}) {
  const synth = window.speechSynthesis
  const voices = synth.getVoices()

  const utter = new SpeechSynthesisUtterance(message)

  const voice = voices.find((voice) => voice.voiceURI === voiceURI)!
  utter.voice = voice

  if (pitch !== undefined) {
    utter.pitch = pitch
  }

  if (rate !== undefined) {
    utter.rate = rate
  }

  synth.speak(utter)
}
