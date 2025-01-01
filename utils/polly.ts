import {PollyClient, SynthesizeSpeechCommand} from '@aws-sdk/client-polly'

import {
  CognitoIdentityClient,
  GetIdCommand,
  GetCredentialsForIdentityCommand,
} from '@aws-sdk/client-cognito-identity'

const REGION = 'ap-southeast-1'
const IDENTITY_POOL_ID = 'ap-southeast-1:809ab693-ab94-490b-8b62-9d44589ebbf7'

let credentials:
  | {
      accessKeyId?: string
      secretAccessKey?: string
      sessionToken?: string
      expiration?: Date
    }
  | undefined

async function getGuestCredentials() {
  const client = new CognitoIdentityClient({region: REGION})

  const {IdentityId} = await client.send(
    new GetIdCommand({
      IdentityPoolId: IDENTITY_POOL_ID,
    })
  )

  const {Credentials} = await client.send(
    new GetCredentialsForIdentityCommand({
      IdentityId,
    })
  )

  if (!Credentials) {
    return
  }

  return {
    accessKeyId: Credentials.AccessKeyId,
    secretAccessKey: Credentials.SecretKey,
    sessionToken: Credentials.SessionToken,
    expiration: Credentials.Expiration,
  }
}

export async function prepareGuestCredentials() {
  if (
    !credentials ||
    (credentials.expiration && credentials.expiration < new Date())
  ) {
    credentials = await getGuestCredentials()

    console.log(
      '--- aws cognito credentials obtained:',
      credentials?.accessKeyId
    )
  }
}

export async function speakWithPolly(message: string) {
  await prepareGuestCredentials()

  if (!credentials) {
    return
  }

  const pollyClient = new PollyClient({
    region: REGION,
    credentials: {
      accessKeyId: credentials.accessKeyId ?? '',
      secretAccessKey: credentials.secretAccessKey ?? '',
      sessionToken: credentials.sessionToken,
    },
  })

  try {
    const command = new SynthesizeSpeechCommand({
      Engine: 'neural',
      LanguageCode: 'cmn-CN',
      OutputFormat: 'mp3',
      Text: message,
      TextType: 'text',
      VoiceId: 'Zhiyu',
    })

    const {AudioStream} = await pollyClient.send(command)

    if (!AudioStream) {
      return
    }

    const hasMSE =
      'MediaSource' in window && MediaSource.isTypeSupported('audio/mpeg')

    if (hasMSE) {
      const mediaSource = new MediaSource()
      const stream = AudioStream.transformToWebStream()
      const audio = new Audio(URL.createObjectURL(mediaSource))

      mediaSource.addEventListener('sourceopen', async () => {
        const sourceBuffer = mediaSource.addSourceBuffer('audio/mpeg')
        const reader = stream.getReader()

        try {
          while (true) {
            const {done, value} = await reader.read()
            if (done) break

            // Wait for any pending updates to complete
            if (sourceBuffer.updating) {
              await new Promise((resolve) => {
                sourceBuffer.addEventListener('updateend', resolve, {
                  once: true,
                })
              })
            }
            sourceBuffer.appendBuffer(value)
          }

          // Wait for final update to complete before ending stream
          if (sourceBuffer.updating) {
            await new Promise((resolve) => {
              sourceBuffer.addEventListener('updateend', resolve, {once: true})
            })
          }
          mediaSource.endOfStream()
        } catch (err) {
          console.error('error streaming audio:', err)
          mediaSource.endOfStream('decode')
        }
      })

      audio.oncanplaythrough = () => audio.play()
      audio.onended = () => {
        URL.revokeObjectURL(audio.src)
        audio.src = ''
      }
    } else {
      const blob = new Blob([await AudioStream.transformToByteArray()], {
        type: 'audio/mpeg',
      })

      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)

      audio.onended = () => URL.revokeObjectURL(url)
      audio.play()
    }
  } catch (error) {
    console.error('Error synthesizing speech:', error)
    throw error
  }
}
