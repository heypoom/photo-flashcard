import {S3Client} from '@aws-sdk/client-s3'
import {nanoid} from 'nanoid'
import isPNG from 'is-png'

import {PutObjectCommand} from '@aws-sdk/client-s3'

const {R2_ACCESS_KEY_ID, R2_SECRET_KEY, R2_ACCOUNT_ID, R2_BUCKET_NAME} =
  process.env

export async function uploadToR2(buffer: Buffer) {
  if (
    !R2_ACCESS_KEY_ID ||
    !R2_SECRET_KEY ||
    !R2_ACCOUNT_ID ||
    !R2_BUCKET_NAME
  ) {
    throw new Error('R2 credentials are missing! Please check your .env file')
  }

  const s3 = new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_KEY,
    },
  })

  const format = isPNG(buffer) ? 'png' : 'jpg'
  const objectKey = `${nanoid()}.${format}`

  const command = new PutObjectCommand({
    Body: buffer,
    Bucket: R2_BUCKET_NAME,
    Key: objectKey,
  })

  await s3.send(command)

  return objectKey
}
