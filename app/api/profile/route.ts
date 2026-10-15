import { compare, hash } from "bcryptjs"
import { z } from "zod"

import { getApiUser } from "@/lib/authz"
import { connectToDatabase } from "@/lib/db/mongoose"
import {
  InvalidJsonError,
  jsonError,
  readJson,
  RequestBodyTooLargeError,
} from "@/lib/http"
import { User } from "@/models"
import { logError } from "@/lib/logger"
import { enforceRateLimit, RateLimitError } from "@/lib/rate-limit"

export const runtime = "nodejs"

const profileSchema = z
  .object({
    name: z.string().trim().min(2).max(80),
    currentPassword: z.string().min(1).max(128).optional(),
    newPassword: z.string().min(10).max(128).optional(),
  })
  .refine(
    (value) => Boolean(value.currentPassword) === Boolean(value.newPassword),
    {
      message: "Both password fields are required to change your password.",
    }
  )

export async function PATCH(request: Request) {
  const sessionUser = await getApiUser()
  if (!sessionUser) return jsonError("Sign in to update your profile.", 401)
  try {
    await enforceRateLimit("profile-update", sessionUser.id, 20, 3600)
    const body = await readJson(request)
    const parsed = profileSchema.safeParse(body)
    if (!parsed.success) return jsonError("Invalid profile update.", 400)
    await connectToDatabase()
    const user = await User.findOne({
      _id: sessionUser.id,
      status: "active",
    }).select("+passwordHash")
    if (!user) return jsonError("Account not found.", 404)
    if (parsed.data.newPassword) {
      if (!(await compare(parsed.data.currentPassword!, user.passwordHash))) {
        return jsonError("Current password is incorrect.", 400)
      }
      user.passwordHash = await hash(parsed.data.newPassword, 12)
    }
    user.name = parsed.data.name
    await user.save()
    return Response.json({ name: user.name })
  } catch (error) {
    if (error instanceof RateLimitError) return jsonError(error.message, 429)
    if (error instanceof InvalidJsonError)
      return jsonError("A JSON request body is required.", 400)
    if (error instanceof RequestBodyTooLargeError)
      return jsonError("Request body is too large.", 413)
    logError("profile_update_failed", error)
    return jsonError("Unable to update your profile right now.", 503)
  }
}
