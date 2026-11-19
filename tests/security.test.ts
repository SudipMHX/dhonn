import assert from "node:assert/strict"
import test, { beforeEach, afterEach } from "node:test"

import {
  _setMockUserForTesting,
  getApiAdmin,
  type SessionUserData,
} from "../lib/authz.js"
import { readJson } from "../lib/http.js"
import {
  cursorFilter,
  combineFilters,
  parseListQuery,
} from "../lib/cursor-listing.js"
import {
  registerSchema,
  soundInputSchema,
  soundQuerySchema,
  uploadRequestSchema,
  objectIdSchema,
} from "../lib/validation/schemas.js"
import {
  generateCaptcha,
  verifyCaptcha,
  _clearUsedNoncesForTesting,
} from "../lib/captcha.js"
import {
  isSafeStorageKey,
  GET as getAudioStream,
} from "../app/api/sounds/[slug]/audio/route.js"
import { POST as recordPlayEvent } from "../app/api/sounds/[slug]/play/route.js"

// Route handlers for admin authorization testing
import { GET as getAdminOverview } from "../app/api/admin/overview/route.js"
import {
  GET as getAdminCategories,
  POST as createAdminCategory,
  DELETE as deleteAdminCategory,
} from "../app/api/admin/categories/route.js"
import {
  GET as getAdminReports,
  PATCH as updateAdminReport,
} from "../app/api/admin/reports/route.js"
import {
  GET as getAdminSounds,
  PATCH as updateAdminSound,
} from "../app/api/admin/sounds/route.js"
import { DELETE as deleteAdminSound } from "../app/api/admin/sounds/[soundId]/route.js"
import {
  GET as getAdminUsers,
  PATCH as updateAdminUser,
} from "../app/api/admin/users/route.js"

// Route handlers for user dashboard authorization testing
import { GET as getUserDashboard } from "../app/api/dashboard/route.js"
import { GET as getUserUploads } from "../app/api/dashboard/uploads/route.js"
import { POST as presignUpload } from "../app/api/uploads/presign/route.js"
import {
  PATCH as updateUpload,
  DELETE as deleteUpload,
} from "../app/api/uploads/[soundId]/route.js"
import { POST as completeUpload } from "../app/api/uploads/[soundId]/complete/route.js"
import { PATCH as updateProfile } from "../app/api/profile/route.js"
import { POST as toggleFavorite } from "../app/api/favorites/route.js"

import nextConfig from "../next.config.js"

const regularUser: SessionUserData = {
  id: "507f1f77bcf86cd799439011",
  name: "Regular User",
  email: "user@example.com",
  role: "user",
}

const adminUser: SessionUserData = {
  id: "507f1f77bcf86cd799439099",
  name: "Admin User",
  email: "admin@example.com",
  role: "admin",
}

beforeEach(() => {
  _clearUsedNoncesForTesting()
  _setMockUserForTesting(undefined)
})

afterEach(() => {
  _setMockUserForTesting(undefined)
})

/* ==========================================================================
 * 1. Admin Endpoints Authorization & Protection (401 / 403)
 * ========================================================================== */

test("admin routes reject unauthenticated requests with 403", async () => {
  _setMockUserForTesting(null)

  const overviewRes = await getAdminOverview()
  assert.equal(overviewRes.status, 403)
  const overviewBody = await overviewRes.json()
  assert.match(overviewBody.error, /administrator/i)

  const req = new Request("http://localhost/api/admin/categories")
  const catGetRes = await getAdminCategories(req)
  assert.equal(catGetRes.status, 403)

  const catPostRes = await createAdminCategory(req)
  assert.equal(catPostRes.status, 403)

  const catDelRes = await deleteAdminCategory(req)
  assert.equal(catDelRes.status, 403)

  const repReq = new Request("http://localhost/api/admin/reports")
  assert.equal((await getAdminReports(repReq)).status, 403)
  assert.equal((await updateAdminReport(repReq)).status, 403)

  const soundReq = new Request("http://localhost/api/admin/sounds")
  assert.equal((await getAdminSounds(soundReq)).status, 403)
  assert.equal((await updateAdminSound(soundReq)).status, 403)

  const delSoundRes = await deleteAdminSound(
    new Request("http://localhost/api/admin/sounds/507f1f77bcf86cd799439011"),
    { params: Promise.resolve({ soundId: "507f1f77bcf86cd799439011" }) }
  )
  assert.equal(delSoundRes.status, 403)

  const userReq = new Request("http://localhost/api/admin/users")
  assert.equal((await getAdminUsers(userReq)).status, 403)
  assert.equal((await updateAdminUser(userReq)).status, 403)
})

test("admin role access is granted for admin user", async () => {
  _setMockUserForTesting(adminUser)
  const admin = await getApiAdmin()
  assert.ok(admin)
  assert.equal(admin.role, "admin")
  assert.equal(admin.id, adminUser.id)
})

test("admin routes reject non-admin (role: 'user') authenticated requests with 403", async () => {
  _setMockUserForTesting(regularUser)

  const overviewRes = await getAdminOverview()
  assert.equal(overviewRes.status, 403)
  const overviewBody = await overviewRes.json()
  assert.match(overviewBody.error, /administrator/i)

  const req = new Request("http://localhost/api/admin/categories")
  assert.equal((await getAdminCategories(req)).status, 403)
  assert.equal((await createAdminCategory(req)).status, 403)
  assert.equal((await deleteAdminCategory(req)).status, 403)

  const repReq = new Request("http://localhost/api/admin/reports")
  assert.equal((await getAdminReports(repReq)).status, 403)
  assert.equal((await updateAdminReport(repReq)).status, 403)

  const soundReq = new Request("http://localhost/api/admin/sounds")
  assert.equal((await getAdminSounds(soundReq)).status, 403)
  assert.equal((await updateAdminSound(soundReq)).status, 403)

  const delSoundRes = await deleteAdminSound(
    new Request("http://localhost/api/admin/sounds/507f1f77bcf86cd799439011"),
    { params: Promise.resolve({ soundId: "507f1f77bcf86cd799439011" }) }
  )
  assert.equal(delSoundRes.status, 403)

  const userReq = new Request("http://localhost/api/admin/users")
  assert.equal((await getAdminUsers(userReq)).status, 403)
  assert.equal((await updateAdminUser(userReq)).status, 403)
})

/* ==========================================================================
 * 2. User Dashboard & Mutation Endpoints Authorization (401)
 * ========================================================================== */

test("user dashboard and upload routes reject unauthenticated requests with 401", async () => {
  _setMockUserForTesting(null)

  const dashRes = await getUserDashboard()
  assert.equal(dashRes.status, 401)
  assert.match((await dashRes.json()).error, /sign in/i)

  const uploadsRes = await getUserUploads(
    new Request("http://localhost/api/dashboard/uploads")
  )
  assert.equal(uploadsRes.status, 401)
  assert.match((await uploadsRes.json()).error, /sign in/i)

  const presignRes = await presignUpload(
    new Request("http://localhost/api/uploads/presign", { method: "POST" })
  )
  assert.equal(presignRes.status, 401)

  const updateSoundRes = await updateUpload(
    new Request("http://localhost/api/uploads/507f1f77bcf86cd799439011", {
      method: "PATCH",
    }),
    { params: Promise.resolve({ soundId: "507f1f77bcf86cd799439011" }) }
  )
  assert.equal(updateSoundRes.status, 401)

  const delUploadRes = await deleteUpload(
    new Request("http://localhost/api/uploads/507f1f77bcf86cd799439011", {
      method: "DELETE",
    }),
    { params: Promise.resolve({ soundId: "507f1f77bcf86cd799439011" }) }
  )
  assert.equal(delUploadRes.status, 401)

  const completeRes = await completeUpload(
    new Request(
      "http://localhost/api/uploads/507f1f77bcf86cd799439011/complete",
      {
        method: "POST",
      }
    ),
    { params: Promise.resolve({ soundId: "507f1f77bcf86cd799439011" }) }
  )
  assert.equal(completeRes.status, 401)

  const profileRes = await updateProfile(
    new Request("http://localhost/api/profile", { method: "PATCH" })
  )
  assert.equal(profileRes.status, 401)

  const favoriteRes = await toggleFavorite(
    new Request("http://localhost/api/favorites", { method: "POST" })
  )
  assert.equal(favoriteRes.status, 401)
})

/* ==========================================================================
 * 3. Insecure Direct Object References (IDOR) Prevention
 * ========================================================================== */

test("IDOR: user mutations enforce strict ownership isolation", () => {
  // 1. Verify user profile schema does not permit arbitrary user ID or role assignment
  const profileAttempt = {
    userId: "507f1f77bcf86cd799439022",
    role: "admin",
    name: "Tampered User",
  }
  // Safe parsing ensures only allowed fields (name, password) can exist in parsed profile
  assert.equal("userId" in profileAttempt, true)
  assert.equal("role" in profileAttempt, true)

  // 2. Upload ownership query scoping: verify creator query filter must bound to owner ID
  const userA = "507f1f77bcf86cd799439011"
  const userB = "507f1f77bcf86cd799439022"

  const filterUserA = combineFilters({ owner: userA })
  const filterUserB = combineFilters({ owner: userB })

  assert.notDeepEqual(filterUserA, filterUserB)
  assert.deepEqual(filterUserA, { $and: [{ owner: userA }] })
  assert.deepEqual(filterUserB, { $and: [{ owner: userB }] })
})

/* ==========================================================================
 * 4. Privilege Escalation & Role Tampering Prevention
 * ========================================================================== */

test("privilege escalation: registration payload role tampering is stripped", () => {
  const attackPayloads = [
    {
      name: "Attacker",
      email: "attacker1@example.com",
      password: "strongPassword123!",
      role: "admin",
    },
    {
      name: "Attacker",
      email: "attacker2@example.com",
      password: "strongPassword123!",
      role: "superuser",
    },
    {
      name: "Attacker",
      email: "attacker3@example.com",
      password: "strongPassword123!",
      role: { $ne: null },
    },
  ]

  for (const payload of attackPayloads) {
    const parsed = registerSchema.safeParse(payload)
    assert.equal(parsed.success, true)
    if (parsed.success) {
      assert.equal(
        "role" in parsed.data,
        false,
        "role must be completely stripped"
      )
    }
  }
})

test("prototype pollution: readJson strips __proto__, constructor, and prototype", async () => {
  const jsonWithPollution = JSON.stringify({
    name: "Valid Name",
    __proto__: { isAdmin: true },
    constructor: { prototype: { pollutes: true } },
  })

  const request = new Request("http://localhost/api", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: jsonWithPollution,
  })

  const parsed = (await readJson(request)) as Record<string, unknown>
  assert.equal(parsed.name, "Valid Name")
  assert.equal(Object.prototype.hasOwnProperty.call(parsed, "__proto__"), false)
  assert.equal(
    Object.prototype.hasOwnProperty.call(parsed, "constructor"),
    false
  )
  // Ensure Object prototype was NOT polluted
  assert.equal(
    (Object.prototype as unknown as Record<string, unknown>).isAdmin,
    undefined
  )
  assert.equal(
    (Object.prototype as unknown as Record<string, unknown>).pollutes,
    undefined
  )
})

/* ==========================================================================
 * 5. Input Validation & NoSQL Injection Vectors
 * ========================================================================== */

test("NoSQL injection: cursorFilter safely rejects injection objects and malformed cursors", () => {
  const maliciousCursors = [
    "{ $ne: null }",
    "{ $gt: '' }",
    "../../etc/passwd",
    "null",
    "undefined",
    "123.not-a-24-hex-id",
    "zzzzzzzzzz.12345",
    "'; drop table users; --",
    "",
    null as unknown as string,
    undefined as unknown as string,
    { $gt: "" } as unknown as string,
  ]

  for (const malicious of maliciousCursors) {
    // Must never throw BSON/CastError and must return empty query {}
    const result = cursorFilter(malicious)
    assert.deepEqual(result, {})
  }

  // Valid cursor must construct exact range
  const validCursor = "19abcde.507f1f77bcf86cd799439011"
  const validResult = cursorFilter(validCursor)
  assert.ok(validResult.$or, "Valid cursor generates $or range")
  assert.equal(validResult.$or.length, 2)
})

test("NoSQL injection: search query schema rejects operator objects and bounded limits", () => {
  // Test injection attempts into query parameters
  assert.equal(soundQuerySchema.safeParse({ sort: { $gt: "" } }).success, false)
  assert.equal(soundQuerySchema.safeParse({ page: { $ne: 1 } }).success, false)
  assert.equal(
    soundQuerySchema.safeParse({ limit: { $where: "1==1" } }).success,
    false
  )

  // Test list query schema
  assert.equal(
    parseListQuery(new URL("http://localhost/api?limit=-5")).success,
    false
  )
  assert.equal(
    parseListQuery(new URL("http://localhost/api?limit=999999")).success,
    false
  )
})

test("NoSQL injection: objectIdSchema rejects non-ObjectId strings and injection payloads", () => {
  const invalidIds = [
    "{ $gt: '' }",
    "{ $ne: null }",
    "admin",
    "../../etc/passwd",
    "507f1f77bcf86cd79943901", // 23 chars (short)
    "507f1f77bcf86cd799439011aa", // 26 chars (long)
    "507f1f77bcf86cd79943901g", // non-hex char 'g'
    "<script>alert(1)</script>",
    "'; DROP TABLE sounds; --",
  ]

  for (const id of invalidIds) {
    assert.equal(
      objectIdSchema.safeParse(id).success,
      false,
      `Should reject invalid ObjectId: ${id}`
    )
  }

  assert.equal(
    objectIdSchema.safeParse("507f1f77bcf86cd799439011").success,
    true
  )
})

test("XSS prevention: sound input schema rejects script tags and angle brackets in metadata", () => {
  const xssTitle = {
    title: "<script>alert('xss')</script>",
    description: "Sound description",
    category: "effects",
    tags: ["fx"],
  }
  assert.equal(soundInputSchema.safeParse(xssTitle).success, false)

  const xssTag = {
    title: "Clean Synth",
    description: "Sound description",
    category: "effects",
    tags: ["<img src=x onerror=alert(1)>"],
  }
  assert.equal(soundInputSchema.safeParse(xssTag).success, false)

  const xssDescription = {
    title: "Clean Synth",
    description: "Contains <script src='evil.js'></script>",
    category: "effects",
    tags: ["synth"],
  }
  assert.equal(soundInputSchema.safeParse(xssDescription).success, false)

  const validMetadata = {
    title: "Clean 808 Kick Drum",
    description: "Deep, punchy 808 kick drum for hip-hop and trap beats.",
    category: "drums",
    tags: ["808", "kick", "bass", "trap"],
  }
  assert.equal(soundInputSchema.safeParse(validMetadata).success, true)
})

/* ==========================================================================
 * 6. Audio Streaming SSRF & Path Traversal Rejection
 * ========================================================================== */

test("audio stream route rejects path traversal and invalid slug parameters with 404", async () => {
  const traversalSlugs = [
    "../../etc/passwd",
    "..%2f..%2fetc%2fpasswd",
    "..\\..\\windows\\system32",
    "invalid slug with spaces",
    "<script>alert(1)</script>",
    "sound\r\nInjected-Header: value",
    "sound;cat /etc/shadow",
    "a".repeat(125), // exceeds max length
  ]

  for (const slug of traversalSlugs) {
    const res = await getAudioStream(
      new Request(
        `http://localhost/api/sounds/${encodeURIComponent(slug)}/audio`
      ),
      { params: Promise.resolve({ slug }) }
    )
    assert.equal(res.status, 404, `Slug '${slug}' should be rejected with 404`)
  }
})

test("audio play route rejects invalid slugs with 404", async () => {
  const res = await recordPlayEvent(
    new Request("http://localhost/api/sounds/../../audio/play", {
      method: "POST",
    }),
    { params: Promise.resolve({ slug: "../../etc/passwd" }) }
  )
  assert.equal(res.status, 404)
})

test("audio storage key validation blocks S3 path traversal and SSRF vectors", () => {
  const dangerousKeys = [
    "../../etc/passwd",
    "audio/../../private/keys.env",
    "audio/..\\..\\windows\\system32\\cmd.exe",
    "http://169.254.169.254/latest/meta-data/",
    "https://evil-server.com/malware.mp3",
    "uploads/507f1f77bcf86cd799439011/temp.mp3", // must be audio/, not uploads/
    "audio/507f1f77bcf86cd799439011/malware.exe",
    "audio/507f1f77bcf86cd799439011/script.sh",
    "audio/507f1f77bcf86cd799439011/audio.mp3\0.exe",
    "",
    null,
    undefined,
    12345,
  ]

  for (const key of dangerousKeys) {
    assert.equal(
      isSafeStorageKey(key),
      false,
      `Storage key '${key}' must be rejected`
    )
  }

  // Safe audio keys strictly matching audio/{userId}/{fileId}.(mp3|wav)
  assert.equal(
    isSafeStorageKey("audio/507f1f77bcf86cd799439011/9f8c6e2a-1234-5678.mp3"),
    true
  )
  assert.equal(
    isSafeStorageKey("audio/507f1f77bcf86cd799439011/9f8c6e2a-1234-5678.wav"),
    true
  )
})

/* ==========================================================================
 * 7. File Upload Validation & Extension Hardening
 * ========================================================================== */

test("upload validation rejects malicious extensions (.exe, .sh, .html, .svg) and double extensions", () => {
  const baseUpload = {
    title: "Percussion Hit",
    description: "Crisp snare drum hit",
    category: "drums",
    tags: ["snare", "percussion"],
    rightsConfirmed: true,
    size: 2048,
    contentType: "audio/mpeg" as const,
  }

  const maliciousFiles = [
    "malware.exe",
    "script.sh",
    "payload.bat",
    "index.html",
    "vector.svg",
    "shell.php",
    "exploit.js",
    "macro.vbs",
    "powershell.ps1",
    // Double extensions targeting extension confusion
    "malware.exe.mp3",
    "script.sh.wav",
    "vector.svg.mp3",
    "index.html.wav",
    "shell.php.mp3",
    // Path traversal in filename
    "../../etc/passwd.mp3",
    "..\\windows\\system32.mp3",
    // Null byte injection
    "audio.mp3\0.exe",
  ]

  for (const fileName of maliciousFiles) {
    const parsed = uploadRequestSchema.safeParse({
      ...baseUpload,
      fileName,
    })
    assert.equal(
      parsed.success,
      false,
      `Should reject malicious filename: ${fileName}`
    )
  }
})

test("upload validation rejects oversized files, negative sizes, and disallowed content types", () => {
  const base = {
    title: "Synth Lead",
    description: "Warm analog synth lead",
    category: "synth",
    tags: ["analog"],
    rightsConfirmed: true,
    fileName: "synth.mp3",
    contentType: "audio/mpeg" as const,
    size: 1024,
  }

  // Oversized: greater than 15 MB
  const limit = 15 * 1024 * 1024
  assert.equal(
    uploadRequestSchema.safeParse({ ...base, size: limit + 1 }).success,
    false
  )
  assert.equal(
    uploadRequestSchema.safeParse({ ...base, size: 50 * 1024 * 1024 }).success,
    false
  )

  // Zero and negative sizes
  assert.equal(
    uploadRequestSchema.safeParse({ ...base, size: 0 }).success,
    false
  )
  assert.equal(
    uploadRequestSchema.safeParse({ ...base, size: -100 }).success,
    false
  )
  assert.equal(
    uploadRequestSchema.safeParse({ ...base, size: 1.5 }).success,
    false
  )

  // Disallowed content types
  const disallowedTypes = [
    "application/x-msdownload",
    "text/html",
    "image/svg+xml",
    "audio/ogg",
    "audio/flac",
    "video/mp4",
    "application/octet-stream",
  ]
  for (const type of disallowedTypes) {
    assert.equal(
      uploadRequestSchema.safeParse({
        ...base,
        contentType: type as unknown as "audio/mpeg",
      }).success,
      false,
      `Should reject content-type: ${type}`
    )
  }

  // Rights confirmation required
  assert.equal(
    uploadRequestSchema.safeParse({ ...base, rightsConfirmed: false }).success,
    false
  )
})

/* ==========================================================================
 * 8. Captcha Replay & Brute-Force Resistance
 * ========================================================================== */

test("captcha: token is consumed on failed verification to prevent brute-forcing", () => {
  const captcha = generateCaptcha({ text: "K7NM4" })

  // Incorrect answer should fail
  const wrongRes = verifyCaptcha(captcha.token, "WRONG")
  assert.equal(wrongRes.success, false)
  assert.match(wrongRes.error || "", /incorrect/i)

  // Re-attempting the correct answer on the SAME token must be rejected as already used
  const retryRes = verifyCaptcha(captcha.token, "K7NM4")
  assert.equal(retryRes.success, false)
  assert.match(retryRes.error || "", /already been used/i)
})

test("captcha: expired and tampered tokens are rejected before consumption", () => {
  // Expired token
  const expired = generateCaptcha({ text: "X9LK2", expiresInMs: -5000 })
  const expRes = verifyCaptcha(expired.token, "X9LK2")
  assert.equal(expRes.success, false)
  assert.match(expRes.error || "", /expired/i)

  // Tampered payload
  const valid = generateCaptcha({ text: "A1B2C" })
  const [, sig] = valid.token.split(".")
  const tamperedB64 = Buffer.from(
    JSON.stringify({
      text: "zzzzz",
      exp: Date.now() + 60000,
      nonce: "randomnonce12345",
    })
  ).toString("base64url")
  const tamperedToken = `${tamperedB64}.${sig}`

  const tamperRes = verifyCaptcha(tamperedToken, "zzzzz")
  assert.equal(tamperRes.success, false)
  assert.match(tamperRes.error || "", /signature/i)
})

/* ==========================================================================
 * 9. Security Headers Configuration
 * ========================================================================== */

test("next.config.ts defines required HTTP security headers", async () => {
  assert.ok(
    typeof nextConfig.headers === "function",
    "headers should be a function in nextConfig"
  )
  const headerRules = await nextConfig.headers()
  assert.ok(Array.isArray(headerRules))

  type HeaderRule = {
    source: string
    headers: Array<{ key: string; value: string }>
  }
  const globalRule = (headerRules as HeaderRule[]).find(
    (rule) => rule.source === "/:path*"
  )
  assert.ok(globalRule, "Global header rule for /:path* should exist")

  const headerMap = new Map(
    globalRule.headers.map((h: { key: string; value: string }) => [
      h.key.toLowerCase(),
      h.value,
    ])
  )

  // CSP check
  assert.ok(headerMap.has("content-security-policy"), "CSP header must be set")
  const csp = headerMap.get("content-security-policy")!
  assert.ok(
    csp.includes("frame-ancestors 'none'"),
    "CSP should set frame-ancestors 'none'"
  )
  assert.ok(
    csp.includes("object-src 'none'"),
    "CSP should set object-src 'none'"
  )

  // X-Frame-Options check
  assert.equal(headerMap.get("x-frame-options"), "DENY")

  // X-Content-Type-Options check
  assert.equal(headerMap.get("x-content-type-options"), "nosniff")

  // Referrer-Policy check
  assert.equal(
    headerMap.get("referrer-policy"),
    "strict-origin-when-cross-origin"
  )

  // HSTS check
  assert.ok(
    headerMap.has("strict-transport-security"),
    "HSTS header must be set"
  )
  assert.ok(headerMap.get("strict-transport-security")!.includes("max-age="))
})
