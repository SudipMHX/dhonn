import assert from "node:assert/strict"
import test, { beforeEach } from "node:test"
import {
  generateCaptcha,
  verifyCaptcha,
  CAPTCHA_CHARSET,
  _clearUsedNoncesForTesting,
} from "../lib/captcha.js"
import { getCaptchaAction } from "../lib/actions/captcha.js"

beforeEach(() => {
  _clearUsedNoncesForTesting()
})

test("generating a captcha returns a valid token and SVG", () => {
  const result = generateCaptcha()

  assert.ok(result.token, "Token should be returned")
  assert.equal(typeof result.token, "string")
  assert.ok(
    result.token.includes("."),
    "Token should consist of payload and signature"
  )

  const [payloadB64, signature] = result.token.split(".")
  assert.ok(
    payloadB64 && signature,
    "Token should contain non-empty payload and signature"
  )

  const payload = JSON.parse(
    Buffer.from(payloadB64, "base64url").toString("utf8")
  )
  assert.equal(typeof payload.text, "string")
  assert.equal(payload.text.length, 5, "Generated code should be 5 characters")
  assert.equal(typeof payload.exp, "number")
  assert.ok(payload.exp > Date.now(), "Expiration should be in the future")
  assert.equal(typeof payload.nonce, "string")
  assert.equal(
    payload.nonce.length,
    16,
    "Nonce should be 16 hex chars (8 bytes)"
  )

  // Ensure all characters in payload.text belong to the safe charset
  for (const char of payload.text.toUpperCase()) {
    assert.ok(
      CAPTCHA_CHARSET.includes(char),
      `Character ${char} should be in safe charset`
    )
  }

  // Verify SVG format and encoding
  assert.ok(
    result.svg.startsWith("data:image/svg+xml;utf8,"),
    "SVG should be encoded as data URL"
  )
  const decodedSvg = decodeURIComponent(
    result.svg.replace(/^data:image\/svg\+xml;utf8,/, "")
  )
  assert.ok(
    decodedSvg.includes("<svg"),
    "Decoded SVG should contain <svg element"
  )
  assert.ok(decodedSvg.includes("</svg>"), "Decoded SVG should contain </svg>")
  assert.ok(
    decodedSvg.includes("<circle"),
    "Decoded SVG should contain noise circles"
  )
  assert.ok(
    decodedSvg.includes("<path"),
    "Decoded SVG should contain noise lines"
  )
})

test("verifying with correct answer succeeds", () => {
  const captcha = generateCaptcha({ text: "H7KM9" })
  const res = verifyCaptcha(captcha.token, "H7KM9")
  assert.deepEqual(res, { success: true })
})

test("verifying with incorrect answer fails", () => {
  const captcha = generateCaptcha({ text: "H7KM9" })
  const res = verifyCaptcha(captcha.token, "WRONG")
  assert.equal(res.success, false)
  assert.match(res.error || "", /incorrect/i)
})

test("verifying is case-insensitive and trims whitespace", () => {
  const captcha = generateCaptcha({ text: "P3XR8" })

  // Lowercase
  const lowerRes = verifyCaptcha(captcha.token, "p3xr8")
  assert.deepEqual(lowerRes, { success: true })

  // Another captcha for whitespace test (since previous one is consumed)
  const captcha2 = generateCaptcha({ text: "Q4YT9" })
  const spaceRes = verifyCaptcha(captcha2.token, "   q4yt9   ")
  assert.deepEqual(spaceRes, { success: true })
})

test("verifying an expired token fails", () => {
  // Generate a token that expired 1 second ago
  const expiredCaptcha = generateCaptcha({
    text: "M9LK2",
    expiresInMs: -1000,
  })

  const res = verifyCaptcha(expiredCaptcha.token, "M9LK2")
  assert.equal(res.success, false)
  assert.match(res.error || "", /expired/i)
})

test("verifying a tampered token or signature mismatch fails", () => {
  const captcha = generateCaptcha({ text: "H7KM9" })
  const [payloadB64, signature] = captcha.token.split(".")

  // Tamper with payload (change the code inside payload)
  const originalPayload = JSON.parse(
    Buffer.from(payloadB64, "base64url").toString("utf8")
  )
  const tamperedPayload = { ...originalPayload, text: "zzzzz" }
  const tamperedPayloadB64 = Buffer.from(
    JSON.stringify(tamperedPayload)
  ).toString("base64url")

  const tamperedToken = `${tamperedPayloadB64}.${signature}`
  const tamperRes = verifyCaptcha(tamperedToken, "zzzzz")
  assert.equal(tamperRes.success, false)
  assert.match(tamperRes.error || "", /signature/i)

  // Tamper with signature
  const invertedSig = signature.startsWith("a")
    ? "b" + signature.slice(1)
    : "a" + signature.slice(1)
  const tamperedSigToken = `${payloadB64}.${invertedSig}`
  const sigRes = verifyCaptcha(tamperedSigToken, "H7KM9")
  assert.equal(sigRes.success, false)
  assert.match(sigRes.error || "", /signature/i)

  // Malformed tokens
  assert.equal(
    verifyCaptcha("invalid-token-without-dot", "H7KM9").success,
    false
  )
  assert.equal(verifyCaptcha("", "H7KM9").success, false)
})

test("replay protection prevents verifying the same token twice", () => {
  const captcha = generateCaptcha({ text: "B4NM8" })

  // First verification must succeed
  const firstRes = verifyCaptcha(captcha.token, "B4NM8")
  assert.deepEqual(firstRes, { success: true })

  // Second verification of the exact same token must fail
  const secondRes = verifyCaptcha(captcha.token, "B4NM8")
  assert.equal(secondRes.success, false)
  assert.match(secondRes.error || "", /already been used/i)
})

test("getCaptchaAction server action generates valid captcha consumable by verifyCaptcha", async () => {
  const actionResult = await getCaptchaAction()
  assert.ok(actionResult.token)
  assert.ok(actionResult.svg)
  assert.ok(actionResult.svg.startsWith("data:image/svg+xml;utf8,"))

  const [payloadB64] = actionResult.token.split(".")
  const payload = JSON.parse(
    Buffer.from(payloadB64, "base64url").toString("utf8")
  )

  const verifyRes = verifyCaptcha(actionResult.token, payload.text)
  assert.deepEqual(verifyRes, { success: true })
})
