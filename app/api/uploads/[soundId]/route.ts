import { getApiUser } from "@/lib/authz"
import { connectToDatabase } from "@/lib/db/mongoose"
import {
  InvalidJsonError,
  jsonError,
  readJson,
  RequestBodyTooLargeError,
} from "@/lib/http"
import { logError } from "@/lib/logger"
import { enforceRateLimit, RateLimitError } from "@/lib/rate-limit"
import {
  isObjectLockedByBucketPolicy,
  permanentlyDeleteSound,
} from "@/lib/services/remove-sound"
import { Category, Sound } from "@/models"
import { objectIdSchema, soundInputSchema } from "@/lib/validation/schemas"

export const runtime = "nodejs"

export async function PATCH(
  request: Request,
  context: RouteContext<"/api/uploads/[soundId]">
) {
  const user = await getApiUser()
  if (!user) return jsonError("Sign in to update uploads.", 401)
  const { soundId } = await context.params
  if (!objectIdSchema.safeParse(soundId).success)
    return jsonError("Upload not found.", 404)
  try {
    await enforceRateLimit("creator-upload-update", user.id, 30, 3600)
    const body = await readJson(request)
    const parsed = soundInputSchema.safeParse(body)
    if (!parsed.success) return jsonError("Invalid upload details.", 400)
    await connectToDatabase()
    const sound = await Sound.findOne({ _id: soundId, owner: user.id })
    if (!sound) return jsonError("Upload not found.", 404)
    if (sound.status === "uploading" || sound.status === "removed")
      return jsonError("This upload cannot be edited yet.", 409)
    const category = await Category.findOne({ slug: parsed.data.category })
      .select("_id name")
      .lean()
    if (!category) return jsonError("Choose a valid category.", 400)
    sound.title = parsed.data.title
    sound.description = parsed.data.description
    sound.category = category._id
    sound.categoryName = category.name
    sound.tags = parsed.data.tags
    sound.status = "pending"
    sound.moderationNote = ""
    sound.publishedAt = null
    await sound.save()
    return Response.json({ status: sound.status })
  } catch (error) {
    if (error instanceof RateLimitError) return jsonError(error.message, 429)
    if (error instanceof InvalidJsonError)
      return jsonError("A JSON request body is required.", 400)
    if (error instanceof RequestBodyTooLargeError)
      return jsonError("Request body is too large.", 413)
    logError("creator_upload_update_failed", error)
    return jsonError("Unable to update this upload right now.", 503)
  }
}

export async function DELETE(
  _request: Request,
  context: RouteContext<"/api/uploads/[soundId]">
) {
  const user = await getApiUser()
  if (!user) return jsonError("Sign in to manage uploads.", 401)
  const { soundId } = await context.params
  if (!objectIdSchema.safeParse(soundId).success)
    return jsonError("Upload not found.", 404)
  try {
    await enforceRateLimit("upload-remove", user.id, 20, 3600)
    await connectToDatabase()
    const sound = await Sound.findOne({ _id: soundId, owner: user.id })
      .select("audio.storageKey")
      .lean()
    if (!sound) return jsonError("Upload not found.", 404)
    const removed = await permanentlyDeleteSound(
      sound._id.toString(),
      sound.audio.storageKey
    )
    if (!removed) return jsonError("Upload not found.", 404)
    return Response.json({ removed: true })
  } catch (error) {
    if (error instanceof RateLimitError) return jsonError(error.message, 429)
    logError("user_upload_removal_failed", error)
    if (isObjectLockedByBucketPolicy(error)) {
      return jsonError(
        "Cloudflare R2 is retaining this audio file under a bucket lock rule. Contact an administrator to review the bucket's Settings → Bucket lock rules.",
        409
      )
    }
    return jsonError("Unable to safely remove this upload.", 503)
  }
}
