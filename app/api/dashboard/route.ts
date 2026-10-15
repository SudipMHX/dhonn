import { getApiUser } from "@/lib/authz"
import { jsonError } from "@/lib/http"
import { getUserDashboardData } from "@/lib/services/sounds"
import { logError } from "@/lib/logger"

export const runtime = "nodejs"

export async function GET() {
  const user = await getApiUser()
  if (!user) return jsonError("Sign in to view your dashboard.", 401)
  try {
    return Response.json(await getUserDashboardData(user.id))
  } catch (error) {
    logError("dashboard_load_failed", error)
    return jsonError("Unable to load your dashboard right now.", 503)
  }
}
