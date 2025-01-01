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

    await playbackPollyAudioStream(AudioStream)
  } catch (error) {
    console.error('error synthesizing speech:', error)
    throw error
  }
}
