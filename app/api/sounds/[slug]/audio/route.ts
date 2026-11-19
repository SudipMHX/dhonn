import { GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

import { jsonError } from "@/lib/http"
import { connectToDatabase } from "@/lib/db/mongoose"
import { getStorageClient, getStorageConfig } from "@/lib/storage/s3"
import { Sound } from "@/models"
import { logError } from "@/lib/logger"

export const runtime = "nodejs"

/**
 * Validates that an S3 audio storage key resides strictly under audio/ and cannot
 * traverse directories or perform SSRF attacks.
 */
export function isSafeStorageKey(key: unknown): boolean {
  if (typeof key !== "string" || !key.startsWith("audio/")) return false
  if (
    key.includes("..") ||
    key.includes("\\") ||
    key.includes("://") ||
    key.includes("\0")
  ) {
    return false
  }
  return /^audio\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+\.(mp3|wav)$/.test(key)
}

export async function GET(
  request: Request,
  context: RouteContext<"/api/sounds/[slug]/audio">
) {
  const { slug } = await context.params
  if (
    !slug ||
    typeof slug !== "string" ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(slug) ||
    slug.length > 120
  ) {
    return jsonError("Sound not found.", 404)
  }

  const download = new URL(request.url).searchParams.get("download") === "1"
  try {
    await connectToDatabase()
    const sound = await Sound.findOne({ slug, status: "published" })
      .select("audio.storageKey audio.contentType")
      .lean()
    if (!sound) return jsonError("Sound not found.", 404)

    if (!isSafeStorageKey(sound.audio?.storageKey)) {
      logError(
        "audio_delivery_invalid_key",
        new Error("Suspicious storage key detected.")
      )
      return jsonError("Audio file cannot be located.", 403)
    }

    if (!["audio/mpeg", "audio/wav"].includes(sound.audio.contentType)) {
      return jsonError("Unsupported audio format.", 415)
    }

    const config = getStorageConfig()
    const storageClient = getStorageClient()
    const rawRange = request.headers.get("range")
    const safeRange =
      rawRange && /^bytes=\d*-\d*(?:,\s*\d*-\d*)*$/.test(rawRange)
        ? rawRange
        : undefined

    const extension = sound.audio.contentType === "audio/wav" ? "wav" : "mp3"
    const safeSlug = slug.replace(/[^a-zA-Z0-9_-]/g, "_")
    const contentDisposition = `attachment; filename="${safeSlug}.${extension}"`

    const command = new GetObjectCommand({
      Bucket: config.bucket,
      Key: sound.audio.storageKey,
      ...(safeRange ? { Range: safeRange } : {}),
      ...(download
        ? {
            ResponseContentDisposition: contentDisposition,
          }
        : {}),
    })

    if (!download) {
      const object = await storageClient.send(command)
      if (!object.Body) {
        logError(
          "audio_delivery_empty_object",
          new Error("Audio object has no body.")
        )
        return jsonError("Audio delivery is temporarily unavailable.", 503)
      }

      const headers = new Headers({
        "Accept-Ranges": "bytes",
        "Content-Type": sound.audio.contentType,
      })
      if (object.ContentLength !== undefined) {
        headers.set("Content-Length", String(object.ContentLength))
      }
      if (object.ContentRange) headers.set("Content-Range", object.ContentRange)

      return new Response(object.Body.transformToWebStream(), {
        status: object.ContentRange ? 206 : 200,
        headers,
      })
    }

    const url = await getSignedUrl(storageClient, command, { expiresIn: 300 })
    return Response.redirect(url, 302)
  } catch (error) {
    logError("audio_delivery_failed", error)
    return jsonError("Audio delivery is temporarily unavailable.", 503)
  }
}
