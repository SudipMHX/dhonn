import { getApiUser } from "@/lib/authz"
import { connectToDatabase } from "@/lib/db/mongoose"
import { toggleFavorite } from "@/lib/services/sounds"
import { objectIdSchema } from "@/lib/validation/schemas"
import {
  InvalidJsonError,
  jsonError,
  readJson,
  RequestBodyTooLargeError,
} from "@/lib/http"
import { Favorite } from "@/models"
import { logError } from "@/lib/logger"
import { enforceRateLimit } from "@/lib/rate-limit"

export const runtime = "nodejs"

export async function GET() {
  const user = await getApiUser()
  if (!user) return Response.json({ soundIds: null })
  try {
    await connectToDatabase()
    const favorites = await Favorite.find({ user: user.id })
      .select("sound")
      .sort({ createdAt: -1 })
      .limit(200)
      .lean()
    return Response.json({
      soundIds: favorites.map((favorite) => favorite.sound.toString()),
    })
  } catch (error) {
    logError("favorite_list_failed", error)
    return jsonError("Unable to load favorites.", 503)
  }
}

export async function POST(request: Request) {
  const user = await getApiUser()
  if (!user) return jsonError("Sign in to save favorites.", 401)
  try {
    await enforceRateLimit("favorite", user.id, 60, 60)
    const body = await readJson(request)
    const id =
      body && typeof body === "object" && "soundId" in body
        ? body.soundId
        : null
    const parsed = objectIdSchema.safeParse(id)
    if (!parsed.success) return jsonError("Invalid sound.", 400)
    return Response.json(await toggleFavorite(user.id, parsed.data))
  } catch (error) {
    if (error instanceof InvalidJsonError)
      return jsonError("A JSON request body is required.", 400)
    if (error instanceof RequestBodyTooLargeError)
      return jsonError("Request body is too large.", 413)
    logError("favorite_update_failed", error)
    return jsonError(
      error instanceof Error ? error.message : "Unable to update favorite.",
      500
    )
  }
}
