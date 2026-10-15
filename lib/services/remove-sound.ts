import { DeleteObjectCommand } from "@aws-sdk/client-s3"

import { Favorite, PlayEvent, Report, Sound } from "@/models"
import { getStorageClient, getStorageConfig } from "@/lib/storage/s3"

export function isObjectLockedByBucketPolicy(error: unknown): boolean {
  return error instanceof Error && error.name === "ObjectLockedByBucketPolicy"
}

export async function permanentlyDeleteSound(
  soundId: string,
  storageKey: string
) {
  const config = getStorageConfig()
  await getStorageClient().send(
    new DeleteObjectCommand({ Bucket: config.bucket, Key: storageKey })
  )

  await Promise.all([
    Favorite.deleteMany({ sound: soundId }),
    Report.deleteMany({ sound: soundId }),
    PlayEvent.deleteMany({ sound: soundId }),
  ])

  const result = await Sound.deleteOne({ _id: soundId })
  return result.deletedCount > 0
}
