import { hash } from "bcryptjs"

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
import { User } from "@/models"
import { registerSchema } from "@/lib/validation/schemas"
import { logError } from "@/lib/logger"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    await enforceRateLimit("register", await getRequestSubject(), 5, 3600)
    const body = await readJson(request)
    const parsed = registerSchema.safeParse(body)
    if (!parsed.success)
      return Response.json(
        { error: "Enter a valid name, email, and password (10+ characters)." },
        { status: 400 }
      )

    await connectToDatabase()
    const email = parsed.data.email.toLowerCase()
    if (await User.exists({ email }))
      return Response.json(
        { error: "An account with that email already exists." },
        { status: 409 }
      )

    const passwordHash = await hash(parsed.data.password, 12)
    const user = await User.create({
      name: parsed.data.name,
      email,
      passwordHash,
    })
    return Response.json({ id: user._id.toString() }, { status: 201 })
  } catch (error) {
    if (error instanceof RateLimitError)
      return Response.json({ error: error.message }, { status: 429 })
    if (error instanceof InvalidJsonError)
      return jsonError("A JSON request body is required.", 400)
    if (error instanceof RequestBodyTooLargeError)
      return jsonError("Request body is too large.", 413)
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === 11000
    ) {
      return Response.json(
        { error: "An account with that email already exists." },
        { status: 409 }
      )
    }
    logError("registration_failed", error)
    return Response.json(
      { error: "Unable to create the account right now." },
      { status: 500 }
    )
  }
}
