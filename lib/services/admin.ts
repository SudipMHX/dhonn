import { connectToDatabase } from "@/lib/db/mongoose"
import { Category, PlayEvent, Report, Sound, User } from "@/models"

export async function getAdminOverview() {
  await connectToDatabase()
  const [
    sounds,
    pendingUploads,
    reports,
    users,
    playsToday,
    categories,
    recentPending,
    recentReports,
  ] = await Promise.all([
    Sound.countDocuments({ status: "published" }),
    Sound.countDocuments({ status: "pending" }),
    Report.countDocuments({ status: { $in: ["open", "reviewing"] } }),
    User.estimatedDocumentCount(),
    PlayEvent.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    }),
    Category.estimatedDocumentCount(),
    Sound.find({ status: "pending" })
      .select(
        "title slug categoryName owner audio.durationSeconds createdAt"
      )
      .populate("owner", "name email")
      .sort({ createdAt: -1 })
      .limit(4)
      .lean(),
    Report.find({ status: { $in: ["open", "reviewing"] } })
      .select("type email details status createdAt sound")
      .populate("sound", "title slug")
      .sort({ createdAt: -1 })
      .limit(3)
      .lean(),
  ])

  return {
    sounds,
    pendingUploads,
    reports,
    users,
    playsToday,
    categories,
    recentPending: JSON.parse(JSON.stringify(recentPending)),
    recentReports: JSON.parse(JSON.stringify(recentReports)),
  }
}
