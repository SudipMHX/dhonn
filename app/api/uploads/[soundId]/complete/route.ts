import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3"
import { parseBuffer } from "music-metadata"

import { getApiUser } from "@/lib/authz"
import { connectToDatabase } from "@/lib/db/mongoose"
import { jsonError } from "@/lib/http"
import { enforceRateLimit, RateLimitError } from "@/lib/rate-limit"
import { getStorageClient, getStorageConfig } from "@/lib/storage/s3"
import { Sound } from "@/models"
import { objectIdSchema } from "@/lib/validation/schemas"
import { createHash } from "node:crypto"
import { logError } from "@/lib/logger"

export const runtime = "nodejs"

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

export async function POST(
  _request: Request,
  context: RouteContext<"/api/uploads/[soundId]/complete">
) {
  const user = await getApiUser()
  if (!user) return jsonError("Sign in to complete an upload.", 401)
  const { soundId } = await context.params
  if (!objectIdSchema.safeParse(soundId).success)
    return jsonError("Upload not found.", 404)

  try {
    await enforceRateLimit("upload-complete", user.id, 10, 3600)
    await connectToDatabase()
    const sound = await Sound.findOne({
      _id: soundId,
      owner: user.id,
      status: "uploading",
    })
    if (!sound) return jsonError("Upload not found.", 404)

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
        user.id,
        sound.audio.storageKey,
        config.bucket
      )
      return jsonError(
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
      return jsonError("Uploaded audio could not be verified.", 400)
    const bytes = await object.Body.transformToByteArray()
    if (
      bytes.byteLength !== sound.audio.bytes ||
      !signatureIsValid(bytes, sound.audio.contentType)
    ) {
      await discardInvalidUpload(
        soundId,
        user.id,
        sound.audio.storageKey,
        config.bucket
      )
      return jsonError(
        "The uploaded file is not a supported audio format.",
        400
      )
    }

    let metadata
    try {
      metadata = await parseBuffer(
        Buffer.from(bytes),
        sound.audio.contentType,
        { duration: true }
      )
    } catch {
      await discardInvalidUpload(
        soundId,
        user.id,
        sound.audio.storageKey,
        config.bucket
      )
      return jsonError("The audio file could not be parsed.", 400)
    }
    const durationSeconds = metadata.format.duration ?? 0
    if (
      !Number.isFinite(durationSeconds) ||
      durationSeconds <= 0 ||
      durationSeconds > 30
    ) {
      await discardInvalidUpload(
        soundId,
        user.id,
        sound.audio.storageKey,
        config.bucket
      )
      return jsonError(
        "Audio must be longer than zero seconds and no longer than 30 seconds.",
        400
      )
    }

    const sha256 = createHash("sha256").update(bytes).digest("hex")
    if (
      await Sound.exists({ "audio.sha256": sha256, _id: { $ne: sound._id } })
    ) {
      await discardInvalidUpload(
        soundId,
        user.id,
        sound.audio.storageKey,
        config.bucket
      )
      return jsonError("That audio has already been uploaded.", 409)
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
            new DeleteObjectCommand({
              Bucket: config.bucket,
              Key: permanentKey,
            })
          ),
          discardInvalidUpload(soundId, user.id, stagingKey, config.bucket),
        ])
        return jsonError("That audio has already been uploaded.", 409)
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
    return Response.json({ status: "pending", durationSeconds })
  } catch (error) {
    if (error instanceof RateLimitError) return jsonError(error.message, 429)
    logError("upload_verification_failed", error)
    return jsonError("Unable to verify this upload right now.", 503)
  }
}
