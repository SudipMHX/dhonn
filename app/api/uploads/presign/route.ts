import { PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { randomUUID } from "node:crypto"

import { getApiUser } from "@/lib/authz"
import { connectToDatabase } from "@/lib/db/mongoose"
import {
  InvalidJsonError,
  jsonError,
  readJson,
  RequestBodyTooLargeError,
} from "@/lib/http"
import { enforceRateLimit, RateLimitError } from "@/lib/rate-limit"
import { getStorageClient, getStorageConfig } from "@/lib/storage/s3"
import { Category, Sound } from "@/models"
import { uploadRequestSchema } from "@/lib/validation/schemas"
import { logError } from "@/lib/logger"

export const runtime = "nodejs"

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 72)
}

export async function POST(request: Request) {
  const user = await getApiUser()
  if (!user) return jsonError("Sign in to upload a sound.", 401)

  try {
    await enforceRateLimit("upload", user.id, 10, 3600)
    const body = await readJson(request)
    const parsed = uploadRequestSchema.safeParse(body)
    if (!parsed.success)
      return jsonError("Invalid upload details or file size.", 400)

    await connectToDatabase()
    const input = parsed.data
    const extension = input.contentType === "audio/mpeg" ? "mp3" : "wav"
    if (!input.fileName.toLowerCase().endsWith(`.${extension}`)) {
      return jsonError(
        "The file extension does not match its audio format.",
        400
      )
    }
    const category = await Category.findOne({ slug: slugify(input.category) })
      .select("_id name")
      .lean()
    if (!category) return jsonError("Choose an available category.", 400)

    const baseSlug = slugify(input.title) || "sound"
    let slug = `${baseSlug}-${randomUUID().slice(0, 8)}`
    while (await Sound.exists({ slug }))
      slug = `${baseSlug}-${randomUUID().slice(0, 8)}`

    const config = getStorageConfig()
    const storageKey = `uploads/${user.id}/${randomUUID()}.${extension}`
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
      owner: user.id,
      status: "uploading",
      rightsConfirmedAt: new Date(),
      audio: {
        storageKey,
        contentType: input.contentType,
        bytes: input.size,
        durationSeconds: 0,
      },
    })
    return Response.json(
      {
        soundId: sound._id.toString(),
        uploadUrl,
        contentType: input.contentType,
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof RateLimitError) return jsonError(error.message, 429)
    if (error instanceof InvalidJsonError)
      return jsonError("A JSON request body is required.", 400)
    if (error instanceof RequestBodyTooLargeError)
      return jsonError("Request body is too large.", 413)
    logError("upload_authorization_failed", error)
    return jsonError("Unable to start this upload right now.", 503)
  }
}
