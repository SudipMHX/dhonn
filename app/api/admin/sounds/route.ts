import { getApiAdmin } from "@/lib/authz"
import { connectToDatabase } from "@/lib/db/mongoose"
import {
  InvalidJsonError,
  jsonError,
  readJson,
  RequestBodyTooLargeError,
} from "@/lib/http"
import { Category, Sound } from "@/models"
import { adminSoundUpdateSchema } from "@/lib/validation/schemas"
import { logError } from "@/lib/logger"
import {
  combineFilters,
  cursorFilter,
  pageResults,
  textSearch,
  parseListQuery,
} from "@/lib/cursor-listing"

export const runtime = "nodejs"

export async function GET(request: Request) {
  if (!(await getApiAdmin()))
    return jsonError("Administrator access required.", 403)
  try {
    const url = new URL(request.url)
    const parsed = parseListQuery(url)
    if (!parsed.success) return jsonError("Invalid list query.", 400)
    await connectToDatabase()
    const status = url.searchParams.get("status")
    if (
      status &&
      status !== "all" &&
      !["pending", "published", "rejected", "removed"].includes(status)
    ) {
      return jsonError("Invalid sound status.", 400)
    }
    const filter = status && status !== "all" ? { status } : {}
    const query = combineFilters(
      filter,
      cursorFilter(parsed.data.after),
      textSearch(parsed.data.q)
    )
    const sounds = await Sound.find(query)
      .select(
        "title description slug status moderationNote categoryName tags owner audio.durationSeconds plays favorites featured trending createdAt"
      )
      .populate("owner", "name email")
      .sort({ createdAt: -1, _id: -1 })
      .limit(parsed.data.limit + 1)
      .lean()
    return Response.json(pageResults(sounds, parsed.data.limit))
  } catch (error) {
    logError("admin_sound_listing_failed", error)
    return jsonError("Unable to load sounds.", 503)
  }
}

export async function PATCH(request: Request) {
  if (!(await getApiAdmin()))
    return jsonError("Administrator access required.", 403)
  try {
    const body = await readJson(request)
    const parsed = adminSoundUpdateSchema.safeParse(body)
    if (!parsed.success) return jsonError("Invalid sound update.", 400)
    await connectToDatabase()
    const {
      id,
      title,
      description,
      category,
      tags,
      status,
      featured,
      trending,
      moderationNote,
    } = parsed.data
    const updates: Record<string, unknown> = {}
    if (title !== undefined) updates.title = title
    if (description !== undefined) updates.description = description
    if (tags !== undefined)
      updates.tags = [...new Set(tags.map((tag) => tag.toLowerCase()))]
    if (category !== undefined) {
      const categoryRecord = await Category.findById(category)
        .select("name")
        .lean()
      if (!categoryRecord) return jsonError("Category not found.", 400)
      updates.category = category
      updates.categoryName = categoryRecord.name
    }
    if (status) {
      if (status === "published") {
        const verified = await Sound.findById(id)
          .select("audio.sha256 audio.durationSeconds")
          .lean()
        if (
          !verified ||
          !verified.audio.sha256 ||
          verified.audio.durationSeconds <= 0
        ) {
          return jsonError(
            "Audio verification must finish before publishing.",
            409
          )
        }
      }
      updates.status = status
      if (status === "published") updates.publishedAt = new Date()
    }
    if (featured !== undefined) updates.featured = featured
    if (trending !== undefined) updates.trending = trending
    if (moderationNote !== undefined) updates.moderationNote = moderationNote
    const sound = await Sound.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    )
      .select("title slug status moderationNote featured trending")
      .lean()
    return sound ? Response.json(sound) : jsonError("Sound not found.", 404)
  } catch (error) {
    if (error instanceof InvalidJsonError)
      return jsonError("A JSON request body is required.", 400)
    if (error instanceof RequestBodyTooLargeError)
      return jsonError("Request body is too large.", 413)
    logError("admin_sound_update_failed", error)
    return jsonError("Unable to update sound.", 503)
  }
}
