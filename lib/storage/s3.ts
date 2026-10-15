import { S3Client } from "@aws-sdk/client-s3"

let client: S3Client | undefined

export function getStorageConfig() {
  const {
    S3_ENDPOINT,
    S3_REGION,
    S3_BUCKET,
    S3_ACCESS_KEY_ID,
    S3_SECRET_ACCESS_KEY,
  } = process.env
  if (
    !S3_ENDPOINT ||
    !S3_REGION ||
    !S3_BUCKET ||
    !S3_ACCESS_KEY_ID ||
    !S3_SECRET_ACCESS_KEY
  ) {
    throw new Error(
      "Audio storage configuration is incomplete. Set the S3_* environment variables."
    )
  }
  return {
    endpoint: S3_ENDPOINT,
    region: S3_REGION,
    bucket: S3_BUCKET,
    publicBaseUrl: process.env.AUDIO_PUBLIC_BASE_URL,
  }
}

export function getStorageClient() {
  const config = getStorageConfig()
  client ??= new S3Client({
    endpoint: config.endpoint,
    region: config.region,
    forcePathStyle: true,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    },
  })
  return client
}
