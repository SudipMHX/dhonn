import { GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

import { jsonError } from "@/lib/http"
import { connectToDatabase } from "@/lib/db/mongoose"
import { getStorageClient, getStorageConfig } from "@/lib/storage/s3"
import { Sound } from "@/models"
import { logError } from "@/lib/logger"

export const runtime = "nodejs"

export async function GET(
  request: Request,
  context: RouteContext<"/api/sounds/[slug]/audio">
) {
  const { slug } = await context.params
  const download = new URL(request.url).searchParams.get("download") === "1"
  try {
    await connectToDatabase()
    const sound = await Sound.findOne({ slug, status: "published" })
      .select("audio.storageKey audio.contentType")
      .lean()
    if (!sound) return jsonError("Sound not found.", 404)
    const config = getStorageConfig()
    const storageClient = getStorageClient()
    const range = request.headers.get("range")
    const command = new GetObjectCommand({
      Bucket: config.bucket,
      Key: sound.audio.storageKey,
      ...(range ? { Range: range } : {}),
      ...(download
        ? {
            ResponseContentDisposition: `attachment; filename="${slug}.${sound.audio.contentType === "audio/wav" ? "wav" : "mp3"}`,
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
