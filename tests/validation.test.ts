import assert from "node:assert/strict"
import test from "node:test"
import { Types } from "mongoose"

import {
  InvalidJsonError,
  readJson,
  RequestBodyTooLargeError,
} from "../lib/http.js"
import {
  adminSoundUpdateSchema,
  registerSchema,
  reportSchema,
  soundQuerySchema,
  uploadRequestSchema,
} from "../lib/validation/schemas.js"
import {
  cursorFilter,
  pageResults,
  combineFilters,
  parseListQuery,
} from "../lib/cursor-listing.js"

test("JSON request reader accepts valid JSON bodies", async () => {
  const request = new Request("http://localhost/api", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "Listener" }),
  })
  assert.deepEqual(await readJson(request), { name: "Listener" })
})

test("JSON request reader rejects malformed or non-JSON bodies", async () => {
  const malformed = new Request("http://localhost/api", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{",
  })
  const wrongType = new Request("http://localhost/api", {
    method: "POST",
    headers: { "content-type": "text/plain" },
    body: "{}",
  })
  await assert.rejects(readJson(malformed), InvalidJsonError)
  await assert.rejects(readJson(wrongType), InvalidJsonError)
})

test("JSON request reader rejects bodies that exceed its byte limit", async () => {
  const request = new Request("http://localhost/api", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "Listener" }),
  })
  await assert.rejects(readJson(request, 4), RequestBodyTooLargeError)
})

test("registration rejects weak credentials and strips any client-supplied role", () => {
  assert.equal(
    registerSchema.safeParse({
      name: "A",
      email: "not-an-email",
      password: "weak",
    }).success,
    false
  )
  const parsed = registerSchema.parse({
    name: "Listener",
    email: "listener@example.com",
    password: "long-safe-password",
    role: "admin",
  })
  assert.equal("role" in parsed, false)
})

test("sound search applies strict sorting and bounded pagination", () => {
  assert.equal(
    soundQuerySchema.safeParse({ sort: "newest", page: "1000", limit: "48" })
      .success,
    true
  )
  assert.equal(soundQuerySchema.safeParse({ sort: "unknown" }).success, false)
  assert.equal(soundQuerySchema.safeParse({ page: "1001" }).success, false)
  assert.equal(soundQuerySchema.safeParse({ limit: "1000" }).success, false)
})

test("cursor listing validates bounded pagination and returns next cursors", () => {
  const query = parseListQuery(
    new URL("http://localhost/api/admin/users?limit=50&q=listener")
  )
  assert.equal(query.success, true)
  if (query.success) {
    assert.equal(query.data.limit, 50)
    assert.equal(query.data.q, "listener")
  }
  assert.equal(
    parseListQuery(new URL("http://localhost/api/admin/users?limit=500"))
      .success,
    false
  )
  assert.equal(
    parseListQuery(new URL("http://localhost/api/admin/users?after=invalid"))
      .success,
    false
  )

  const createdAt = new Date("2026-01-02T03:04:05.000Z")
  const firstId = "507f1f77bcf86cd799439011"
  const result = pageResults(
    [
      { _id: { toString: () => firstId }, createdAt },
      {
        _id: { toString: () => "507f1f77bcf86cd799439012" },
        createdAt,
      },
    ],
    1
  )
  assert.equal(result.items.length, 1)
  assert.equal(result.hasMore, true)
  assert.equal(
    result.nextCursor,
    `${createdAt.getTime().toString(36)}.${firstId}`
  )
  assert.deepEqual(combineFilters({}, {}), {})
  const filter = cursorFilter(result.nextCursor ?? undefined)
  assert.deepEqual(filter, {
    $or: [
      { createdAt: { $lt: createdAt } },
      { createdAt, _id: { $lt: new Types.ObjectId(firstId) } },
    ],
  })
})

test("audio upload schema rejects unsupported types and files above the configured limit", () => {
  const base = {
    title: "Soft chime",
    description: "",
    category: "ui",
    tags: ["alert"],
    rightsConfirmed: true,
    fileName: "chime.mp3",
    contentType: "audio/mpeg",
    size: 1024,
  }
  assert.equal(uploadRequestSchema.safeParse(base).success, true)
  assert.equal(
    uploadRequestSchema.safeParse({ ...base, rightsConfirmed: false }).success,
    false
  )
  assert.equal(
    uploadRequestSchema.safeParse({ ...base, contentType: "audio/ogg" })
      .success,
    false
  )
  assert.equal(
    uploadRequestSchema.safeParse({ ...base, size: 15 * 1024 * 1024 + 1 })
      .success,
    false
  )
})

test("admin mutations require a valid sound id and constrained moderation state", () => {
  assert.equal(
    adminSoundUpdateSchema.safeParse({ id: "invalid", status: "published" })
      .success,
    false
  )
  assert.equal(
    adminSoundUpdateSchema.safeParse({
      id: "507f1f77bcf86cd799439011",
      status: "admin",
    }).success,
    false
  )
})

test("reports require enough detail and a valid target sound", () => {
  assert.equal(
    reportSchema.safeParse({
      soundId: "invalid",
      type: "copyright",
      details: "Too short",
    }).success,
    false
  )
  assert.equal(
    reportSchema.safeParse({
      soundId: "507f1f77bcf86cd799439011",
      type: "copyright",
      details: "I own the rights to the audio used in this upload.",
    }).success,
    true
  )
})
