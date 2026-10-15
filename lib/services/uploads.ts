import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { parseBuffer } from "music-metadata"
import { createHash, randomUUID } from "node:crypto"
import type { z } from "zod"

import { connectToDatabase } from "@/lib/db/mongoose"
import { logError } from "@/lib/logger"
import { enforceRateLimit } from "@/lib/rate-limit"
import { getStorageClient, getStorageConfig } from "@/lib/storage/s3"
import { Category, Sound } from "@/models"
import type { uploadRequestSchema } from "@/lib/validation/schemas"

export class UploadServiceError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message)
    this.name = "UploadServiceError"
  }
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 72)
}

export async function createSoundUpload(
  userId: string,
  input: z.infer<typeof uploadRequestSchema>
) {
  await enforceRateLimit("upload", userId, 10, 3600)
  await connectToDatabase()

  const extension = input.contentType === "audio/mpeg" ? "mp3" : "wav"
  if (!input.fileName.toLowerCase().endsWith(`.${extension}`)) {
    throw new UploadServiceError(
      "The file extension does not match its audio format.",
      400
    )
  }
  const category = await Category.findOne({
    slug: slugify(input.category),
  })
    .select("_id name")
    .lean()
  if (!category)
    throw new UploadServiceError("Choose an available category.", 400)

  const baseSlug = slugify(input.title) || "sound"
  let slug = `${baseSlug}-${randomUUID().slice(0, 8)}`
  while (await Sound.exists({ slug }))
    slug = `${baseSlug}-${randomUUID().slice(0, 8)}`

  const config = getStorageConfig()
  const storageKey = `uploads/${userId}/${randomUUID()}.${extension}`
  const uploadUrl = await getSignedUrl(
    getStorageClient(),
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: storageKey,
      ContentType: input.contentType,
    }),
    { expiresIn: 300 }
  )
  const sound = await Sound.create({
    slug,
    title: input.title,
    description: input.description,
    category: category._id,
    categoryName: category.name,
    tags: [...new Set(input.tags.map((tag) => tag.toLowerCase()))],
    owner: userId,
    status: "uploading",
    rightsConfirmedAt: new Date(),
    audio: {
      storageKey,
      contentType: input.contentType,
      bytes: input.size,
      durationSeconds: 0,
    },
  })
  return {
    soundId: sound._id.toString(),
    uploadUrl,
    contentType: input.contentType,
  }
}

function signatureIsValid(bytes: Uint8Array, contentType: string) {
  if (contentType === "audio/wav") {
    return (
      bytes.length >= 12 &&
      String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
      String.fromCharCode(...bytes.slice(8, 12)) === "WAVE"
    )
  }
  return (
    bytes.length >= 4 &&
    (String.fromCharCode(...bytes.slice(0, 3)) === "ID3" ||
      (bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0))
  )
}

async function discardInvalidUpload(
  soundId: string,
  ownerId: string,
  storageKey: string,
  bucket: string
) {
  await getStorageClient().send(
    new DeleteObjectCommand({ Bucket: bucket, Key: storageKey })
  )
  await Sound.deleteOne({ _id: soundId, owner: ownerId })
}

export async function verifySoundUpload(soundId: string, userId: string) {
  await enforceRateLimit("upload-complete", userId, 10, 3600)
  await connectToDatabase()
  const sound = await Sound.findOne({
    _id: soundId,
    owner: userId,
    status: "uploading",
  })
  if (!sound) throw new UploadServiceError("Upload not found.", 404)

  const config = getStorageConfig()
  const client = getStorageClient()
  const head = await client.send(
    new HeadObjectCommand({
      Bucket: config.bucket,
      Key: sound.audio.storageKey,
    })
  )
  if (
    !head.ContentLength ||
    head.ContentLength !== sound.audio.bytes ||
    head.ContentLength > 15 * 1024 * 1024
  ) {
    await discardInvalidUpload(
      soundId,
      userId,
      sound.audio.storageKey,
      config.bucket
    )
    throw new UploadServiceError(
      "The uploaded file size did not match the authorized upload.",
      400
    )
  }

  const object = await client.send(
    new GetObjectCommand({
      Bucket: config.bucket,
      Key: sound.audio.storageKey,
    })
  )
  if (!object.Body)
    throw new UploadServiceError("Uploaded audio could not be verified.", 400)
  const bytes = await object.Body.transformToByteArray()
  if (
    bytes.byteLength !== sound.audio.bytes ||
    !signatureIsValid(bytes, sound.audio.contentType)
  ) {
    await discardInvalidUpload(
      soundId,
      userId,
      sound.audio.storageKey,
      config.bucket
    )
    throw new UploadServiceError(
      "The uploaded file is not a supported audio format.",
      400
    )
  }

  let metadata
  try {
    metadata = await parseBuffer(Buffer.from(bytes), sound.audio.contentType, {
      duration: true,
    })
  } catch {
    await discardInvalidUpload(
      soundId,
      userId,
      sound.audio.storageKey,
      config.bucket
    )
    throw new UploadServiceError("The audio file could not be parsed.", 400)
  }
  const durationSeconds = metadata.format.duration ?? 0
  if (
    !Number.isFinite(durationSeconds) ||
    durationSeconds <= 0 ||
    durationSeconds > 30
  ) {
    await discardInvalidUpload(
      soundId,
      userId,
      sound.audio.storageKey,
      config.bucket
    )
    throw new UploadServiceError(
      "Audio must be longer than zero seconds and no longer than 30 seconds.",
      400
    )
  }

  const sha256 = createHash("sha256").update(bytes).digest("hex")
  if (await Sound.exists({ "audio.sha256": sha256, _id: { $ne: sound._id } })) {
    await discardInvalidUpload(
      soundId,
      userId,
      sound.audio.storageKey,
      config.bucket
    )
    throw new UploadServiceError("That audio has already been uploaded.", 409)
  }
  const stagingKey = sound.audio.storageKey
  const permanentKey = stagingKey.replace(/^uploads\//, "audio/")
  await client.send(
    new CopyObjectCommand({
      Bucket: config.bucket,
      Key: permanentKey,
      CopySource: `${config.bucket}/${encodeURIComponent(stagingKey).replace(/%2F/g, "/")}`,
      ContentType: sound.audio.contentType,
      MetadataDirective: "REPLACE",
    })
  )
  sound.audio.sha256 = sha256
  sound.audio.durationSeconds = durationSeconds
  sound.audio.storageKey = permanentKey
  sound.status = "pending"
  try {
    await sound.save()
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === 11000
    ) {
      await Promise.all([
        client.send(
          new DeleteObjectCommand({ Bucket: config.bucket, Key: permanentKey })
        ),
        discardInvalidUpload(soundId, userId, stagingKey, config.bucket),
      ])
      throw new UploadServiceError("That audio has already been uploaded.", 409)
    }
    await client.send(
      new DeleteObjectCommand({ Bucket: config.bucket, Key: permanentKey })
    )
    throw error
  }
  try {
    await client.send(
      new DeleteObjectCommand({ Bucket: config.bucket, Key: stagingKey })
    )
  } catch (error) {
    logError("verified_upload_staging_cleanup_failed", error)
  }
  return { status: "pending" as const, durationSeconds }
}
