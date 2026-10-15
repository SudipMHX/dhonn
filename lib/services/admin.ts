import { connectToDatabase } from "@/lib/db/mongoose"
import { Category, PlayEvent, Report, Sound, User } from "@/models"

export async function getAdminOverview() {
  await connectToDatabase()
  const [sounds, pendingUploads, reports, users, playsToday, categories] =
    await Promise.all([
      Sound.countDocuments({ status: "published" }),
      Sound.countDocuments({ status: "pending" }),
      Report.countDocuments({ status: { $in: ["open", "reviewing"] } }),
      User.estimatedDocumentCount(),
      PlayEvent.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      }),
      Category.estimatedDocumentCount(),
    ])
  return { sounds, pendingUploads, reports, users, playsToday, categories }
}
