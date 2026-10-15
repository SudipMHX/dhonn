import { getApiUser } from "@/lib/authz"
import { connectToDatabase } from "@/lib/db/mongoose"
import {
  InvalidJsonError,
  jsonError,
  readJson,
  RequestBodyTooLargeError,
} from "@/lib/http"
import {
  enforceRateLimit,
  getRequestSubject,
  RateLimitError,
} from "@/lib/rate-limit"
import { Report, Sound } from "@/models"
import { reportSchema } from "@/lib/validation/schemas"
import { logError } from "@/lib/logger"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const [user, subject] = await Promise.all([
      getApiUser(),
      getRequestSubject(),
    ])
    await enforceRateLimit("report", subject, 5, 3600)
    const body = await readJson(request)
    const parsed = reportSchema.safeParse(body)
    if (!parsed.success)
      return jsonError(
        "Please provide a valid report with at least 20 characters of detail.",
        400
      )
    await connectToDatabase()
    const sound = await Sound.findOne({
      _id: parsed.data.soundId,
      status: "published",
    })
      .select("_id")
      .lean()
    if (!sound) return jsonError("Sound not found.", 404)
    const report = await Report.create({
      sound: sound._id,
      reporter: user?.id ?? null,
      email: parsed.data.email ?? user?.email ?? "",
      type: parsed.data.type,
      details: parsed.data.details,
    })
    return Response.json(
      { id: report._id.toString(), status: report.status },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof RateLimitError) return jsonError(error.message, 429)
    if (error instanceof InvalidJsonError)
      return jsonError("A JSON request body is required.", 400)
    if (error instanceof RequestBodyTooLargeError)
      return jsonError("Request body is too large.", 413)
    logError("report_submission_failed", error)
    return jsonError("Unable to submit the report right now.", 503)
  }
}
