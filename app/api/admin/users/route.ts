import { getApiAdmin } from "@/lib/authz"
import { connectToDatabase } from "@/lib/db/mongoose"
import {
  InvalidJsonError,
  jsonError,
  readJson,
  RequestBodyTooLargeError,
} from "@/lib/http"
import { User } from "@/models"
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

const userUpdateSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i),
  status: z.enum(["active", "suspended"]),
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
      !["active", "suspended"].includes(status)
    ) {
      return jsonError("Invalid user status.", 400)
    }
    await connectToDatabase()
    const query = combineFilters(
      status && status !== "all" ? { status } : {},
      cursorFilter(parsed.data.after),
      textSearch(parsed.data.q)
    )
    const users = await User.find(query)
      .select("name email role status createdAt")
      .sort({ createdAt: -1, _id: -1 })
      .limit(parsed.data.limit + 1)
      .lean()
    return Response.json(pageResults(users, parsed.data.limit))
  } catch (error) {
    logError("admin_user_listing_failed", error)
    return jsonError("Unable to load users.", 503)
  }
}

export async function PATCH(request: Request) {
  const admin = await getApiAdmin()
  if (!admin) return jsonError("Administrator access required.", 403)
  try {
    const body = await readJson(request)
    const parsed = userUpdateSchema.safeParse(body)
    if (!parsed.success) return jsonError("Invalid user update.", 400)
    if (parsed.data.id === admin.id)
      return jsonError("You cannot suspend your own account.", 409)
    await connectToDatabase()
    const user = await User.findByIdAndUpdate(
      parsed.data.id,
      { $set: { status: parsed.data.status } },
      { new: true }
    )
      .select("name email role status")
      .lean()
    return user ? Response.json(user) : jsonError("User not found.", 404)
  } catch (error) {
    if (error instanceof InvalidJsonError)
      return jsonError("A JSON request body is required.", 400)
    if (error instanceof RequestBodyTooLargeError)
      return jsonError("Request body is too large.", 413)
    logError("admin_user_update_failed", error)
    return jsonError("Unable to update user.", 503)
  }
}
