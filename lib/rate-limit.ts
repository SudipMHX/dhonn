import { createHash } from "node:crypto"
import { headers } from "next/headers"

import { RateLimit } from "@/models"
import { connectToDatabase } from "@/lib/db/mongoose"

export async function enforceRateLimit(
  scope: string,
  subject: string,
  limit: number,
  windowSeconds: number
) {
  await connectToDatabase()
  const bucket = Math.floor(Date.now() / (windowSeconds * 1000))
  const key = createHash("sha256")
    .update(`${scope}:${subject}:${bucket}`)
    .digest("hex")
  const expiresAt = new Date((bucket + 1) * windowSeconds * 1000)
  const update = { $inc: { count: 1 }, $setOnInsert: { expiresAt } }
  let record
  try {
    record = await RateLimit.findOneAndUpdate({ key }, update, {
      upsert: true,
      returnDocument: "after",
    }).lean()
  } catch (error) {
    if (!(
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === 11000
    ))
      throw error
    record = await RateLimit.findOneAndUpdate(
      { key },
      { $inc: { count: 1 } },
      { returnDocument: "after" }
    ).lean()
    if (!record) throw error
  }

  if (record.count > limit) {
    throw new RateLimitError()
  }
}

export async function getRequestSubject() {
  const requestHeaders = await headers()
  const address =
    requestHeaders.get("x-real-ip") ??
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  return createHash("sha256")
    .update(`${address}:${requestHeaders.get("user-agent") ?? ""}`)
    .digest("hex")
}

export class RateLimitError extends Error {
  constructor() {
    super("Too many requests. Please wait and try again.")
    this.name = "RateLimitError"
  }
}
