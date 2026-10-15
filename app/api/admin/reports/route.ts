import { getApiAdmin } from "@/lib/authz"
import { connectToDatabase } from "@/lib/db/mongoose"
import {
  InvalidJsonError,
  jsonError,
  readJson,
  RequestBodyTooLargeError,
} from "@/lib/http"
import { Report } from "@/models"
import { z } from "zod"
import { logError } from "@/lib/logger"
import {
  combineFilters,
  cursorFilter,
  pageResults,
  textSearch,
  parseListQuery,
} from "@/lib/cursor-listing"

export const runtime = "nodejs"

const reportUpdateSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i),
  status: z.enum(["reviewing", "resolved", "dismissed"]),
  resolutionNote: z.string().trim().max(500).optional().default(""),
})

export async function GET(request: Request) {
  if (!(await getApiAdmin()))
    return jsonError("Administrator access required.", 403)
  try {
    const url = new URL(request.url)
    const parsed = parseListQuery(url)
    if (!parsed.success) return jsonError("Invalid list query.", 400)
    const status = url.searchParams.get("status")
    if (
      status &&
      status !== "all" &&
      !["open", "reviewing", "resolved", "dismissed"].includes(status)
    ) {
      return jsonError("Invalid report status.", 400)
    }
    await connectToDatabase()
    const query = combineFilters(
      status && status !== "all" ? { status } : {},
      cursorFilter(parsed.data.after),
      textSearch(parsed.data.q)
    )
    const reports = await Report.find(query)
      .populate("sound", "title slug status")
      .sort({ createdAt: -1, _id: -1 })
      .limit(parsed.data.limit + 1)
      .lean()
    return Response.json(pageResults(reports, parsed.data.limit))
  } catch (error) {
    logError("admin_report_listing_failed", error)
    return jsonError("Unable to load reports.", 503)
  }
}

export async function PATCH(request: Request) {
  if (!(await getApiAdmin()))
    return jsonError("Administrator access required.", 403)
  try {
    const body = await readJson(request)
    const parsed = reportUpdateSchema.safeParse(body)
    if (!parsed.success) return jsonError("Invalid report update.", 400)
    await connectToDatabase()
    const report = await Report.findByIdAndUpdate(
      parsed.data.id,
      {
        $set: {
          status: parsed.data.status,
          resolutionNote: parsed.data.resolutionNote,
        },
      },
      { new: true }
    )
      .select("status resolutionNote")
      .lean()
    return report ? Response.json(report) : jsonError("Report not found.", 404)
  } catch (error) {
    if (error instanceof InvalidJsonError)
      return jsonError("A JSON request body is required.", 400)
    if (error instanceof RequestBodyTooLargeError)
      return jsonError("Request body is too large.", 413)
    logError("admin_report_update_failed", error)
    return jsonError("Unable to update report.", 503)
  }
}
