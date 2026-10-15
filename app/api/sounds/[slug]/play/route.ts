import { createHash } from "node:crypto"
import { Types } from "mongoose"

import { getApiUser } from "@/lib/authz"
import { connectToDatabase } from "@/lib/db/mongoose"
import { jsonError } from "@/lib/http"
import {
  enforceRateLimit,
  getRequestSubject,
  RateLimitError,
} from "@/lib/rate-limit"
import { PlayEvent, Sound } from "@/models"
import { logError } from "@/lib/logger"

export const runtime = "nodejs"

export async function POST(
  _request: Request,
  context: RouteContext<"/api/sounds/[slug]/play">
) {
  try {
    const [user, subject, { slug }] = await Promise.all([
      getApiUser(),
      getRequestSubject(),
      context.params,
    ])
    await enforceRateLimit("play-event", subject, 60, 60)
    await connectToDatabase()
    const sound = await Sound.findOne({ slug, status: "published" })
      .select("_id")
      .lean()
    if (!sound) return jsonError("Sound not found.", 404)
    const visitorHash = createHash("sha256").update(subject).digest("hex")
    const bucket = Math.floor(Date.now() / 60000)
    try {
      await PlayEvent.create({
        sound: sound._id,
        user: user?.id && Types.ObjectId.isValid(user.id) ? user.id : null,
        visitorHash,
        bucket,
      })
    } catch (error) {
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === 11000
      ) {
        return Response.json({ recorded: false })
      }
      throw error
    }
    await Sound.updateOne({ _id: sound._id }, { $inc: { plays: 1 } })
    return Response.json({ recorded: true })
  } catch (error) {
    if (error instanceof RateLimitError) return jsonError(error.message, 429)
    logError("play_event_recording_failed", error)
    return jsonError("Unable to record playback right now.", 503)
  }
}
