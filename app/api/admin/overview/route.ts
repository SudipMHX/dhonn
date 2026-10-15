import { getApiAdmin } from "@/lib/authz"
import { connectToDatabase } from "@/lib/db/mongoose"
import { jsonError } from "@/lib/http"
import { Category, PlayEvent, Report, Sound, User } from "@/models"
import { logError } from "@/lib/logger"

export const runtime = "nodejs"

export async function GET() {
  const admin = await getApiAdmin()
  if (!admin) return jsonError("Administrator access required.", 403)
  try {
    await connectToDatabase()
    const [sounds, pendingUploads, reports, users, playsToday, categories] =
      await Promise.all([
        Sound.countDocuments({ status: "published" }),
        Sound.countDocuments({ status: "pending" }),
        Report.countDocuments({ status: { $in: ["open", "reviewing"] } }),
        User.countDocuments(),
        PlayEvent.countDocuments({
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        }),
        Category.countDocuments(),
      ])
    return Response.json({
      sounds,
      pendingUploads,
      reports,
      users,
      playsToday,
      categories,
    })
  } catch (error) {
    logError("admin_overview_failed", error)
    return jsonError("Unable to load admin metrics.", 503)
  }
}
