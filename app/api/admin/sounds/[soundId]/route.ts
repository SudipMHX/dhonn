import { getApiAdmin } from "@/lib/authz"
import { connectToDatabase } from "@/lib/db/mongoose"
import { jsonError } from "@/lib/http"
import {
  isObjectLockedByBucketPolicy,
  permanentlyDeleteSound,
} from "@/lib/services/remove-sound"
import { Sound } from "@/models"
import { objectIdSchema } from "@/lib/validation/schemas"
import { logError } from "@/lib/logger"

export const runtime = "nodejs"

export async function DELETE(
  _request: Request,
  context: RouteContext<"/api/admin/sounds/[soundId]">
) {
  if (!(await getApiAdmin()))
    return jsonError("Administrator access required.", 403)
  const { soundId } = await context.params
  if (!objectIdSchema.safeParse(soundId).success)
    return jsonError("Sound not found.", 404)
  try {
    await connectToDatabase()
    const sound = await Sound.findById(soundId)
      .select("audio.storageKey")
      .lean()
    if (!sound) return jsonError("Sound not found.", 404)
    const removed = await permanentlyDeleteSound(
      sound._id.toString(),
      sound.audio.storageKey
    )
    if (!removed) return jsonError("Sound not found.", 404)
    return Response.json({ removed: true })
  } catch (error) {
    logError("admin_sound_removal_failed", error)
    if (isObjectLockedByBucketPolicy(error)) {
      return jsonError(
        "Cloudflare R2 is retaining this audio file under a bucket lock rule. Check the bucket's Settings → Bucket lock rules, then retry after the retention period expires or the matching rule is corrected.",
        409
      )
    }
    return jsonError("Unable to safely remove this sound.", 503)
  }
}
