import { z } from "zod"

import { getApiUser } from "@/lib/authz"
import { connectToDatabase } from "@/lib/db/mongoose"
import {
  cursorFilter,
  pageResults,
  textSearch,
  combineFilters,
  parseListQuery,
} from "@/lib/cursor-listing"
import { jsonError } from "@/lib/http"
import { logError } from "@/lib/logger"
import { Sound } from "@/models"

export const runtime = "nodejs"

const statusSchema = z.enum([
  "all",
  "uploading",
  "pending",
  "published",
  "rejected",
  "removed",
])

export async function GET(request: Request) {
  const user = await getApiUser()
  if (!user) return jsonError("Sign in to view your uploads.", 401)

  const url = new URL(request.url)
  const parsed = parseListQuery(url)
  const status = statusSchema.safeParse(url.searchParams.get("status") ?? "all")
  if (!parsed.success || !status.success)
    return jsonError("Invalid upload list query.", 400)

  try {
    await connectToDatabase()
    const filter = combineFilters(
      { owner: user.id },
      status.data === "all" ? {} : { status: status.data },
      textSearch(parsed.data.q),
      cursorFilter(parsed.data.after)
    )
    const documents = await Sound.find(filter)
      .select(
        "title description category categoryName tags status moderationNote createdAt publishedAt"
      )
      .populate("category", "slug")
      .sort({ createdAt: -1, _id: -1 })
      .limit(parsed.data.limit + 1)
      .lean()
    return Response.json(pageResults(documents, parsed.data.limit))
  } catch (error) {
    logError("creator_upload_list_failed", error)
    return jsonError("Unable to load your uploads right now.", 503)
  }
}
