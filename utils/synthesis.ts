const PREFERRED_VOICES = ['Li-mu', 'Tingting']

let voice: SpeechSynthesisVoice | null = null

export function getPreferredVoice(
  language = 'zh-CN'
): SpeechSynthesisVoice | null {
  const synth = window.speechSynthesis
  const voices = synth.getVoices()

  for (const voice of voices) {
    if (PREFERRED_VOICES.includes(voice.voiceURI)) {
      return voice
    }
  }

  const voice = voices.find((voice) => voice.lang.includes(language))

  return voice ?? null
}

export function speak({
  message,
  pitch,
  rate,
}: {
  message: string
  pitch?: number
  rate?: number
}) {
  const synth = window.speechSynthesis

  if (!voice) {
    voice = getPreferredVoice()
  }

  if (!voice) {
    return
  }

  const utter = new SpeechSynthesisUtterance(message)
  utter.voice = voice

  if (pitch !== undefined) {
    utter.pitch = pitch
  }

  if (rate !== undefined) {
    utter.rate = rate
  }

  synth.speak(utter)
}
