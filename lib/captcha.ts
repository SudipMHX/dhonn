import {
  createHash,
  createHmac,
  randomBytes,
  randomInt,
  timingSafeEqual,
} from "node:crypto"

export const CAPTCHA_CHARSET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
export const CAPTCHA_CODE_LENGTH = 5
export const DEFAULT_CAPTCHA_EXPIRY_MS = 5 * 60 * 1000 // 5 minutes
const MAX_USED_NONCES = 10000

export interface CaptchaPayload {
  text: string
  exp: number
  nonce: string
}

export interface CaptchaResult {
  token: string
  svg: string
  rawSvg: string
}

export interface VerifyCaptchaResult {
  success: boolean
  error?: string
}

export interface GenerateCaptchaOptions {
  text?: string
  expiresInMs?: number
  width?: number
  height?: number
}

function getSecretKey(): string {
  return (
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    "dhonn-captcha-fallback-secret-2026"
  )
}

/**
 * In-memory bounded store to prevent replay attacks (token reuse).
 * Expired entries are automatically pruned.
 */
class NonceStore {
  private map = new Map<string, number>()
  private lastCleanup = Date.now()

  has(nonce: string): boolean {
    this.maybeCleanup()
    return this.map.has(nonce)
  }

  add(nonce: string, exp: number): void {
    this.maybeCleanup()
    // Bound the store size (LRU eviction of oldest entry)
    if (this.map.size >= MAX_USED_NONCES) {
      const oldestKey = this.map.keys().next().value
      if (oldestKey) {
        this.map.delete(oldestKey)
      }
    }
    this.map.set(nonce, exp)
  }

  clear(): void {
    this.map.clear()
  }

  size(): number {
    return this.map.size
  }

  private maybeCleanup(): void {
    const now = Date.now()
    if (now - this.lastCleanup > 30_000 || this.map.size > MAX_USED_NONCES) {
      this.lastCleanup = now
      for (const [nonce, exp] of this.map.entries()) {
        if (now > exp) {
          this.map.delete(nonce)
        }
      }
    }
  }
}

const nonceStore = new NonceStore()

/**
 * Clear replay store nonces. Intended for test environments.
 */
export function _clearUsedNoncesForTesting(): void {
  nonceStore.clear()
}

/**
 * Generate a cryptographically random code from the safe charset.
 */
function generateRandomCode(length: number = CAPTCHA_CODE_LENGTH): string {
  let result = ""
  for (let i = 0; i < length; i++) {
    const index = randomInt(0, CAPTCHA_CHARSET.length)
    result += CAPTCHA_CHARSET[index]
  }
  return result
}

/**
 * Generate an SVG string with noise, lines, dots, and randomized character transforms.
 */
function generateCaptchaSvg(
  code: string,
  width: number = 160,
  height: number = 50
): string {
  const charColors = [
    "#0f172a", // slate-900
    "#1e293b", // slate-800
    "#1e3a8a", // blue-900
    "#1e40af", // blue-800
    "#065f46", // emerald-800
    "#831843", // pink-900
    "#581c87", // purple-900
    "#312e81", // indigo-900
    "#164e63", // cyan-900
    "#701a75", // fuchsia-900
  ]

  const noiseColors = [
    "#94a3b8",
    "#cbd5e1",
    "#64748b",
    "#a855f7",
    "#3b82f6",
    "#10b981",
    "#f97316",
  ]

  // Generate background noise lines (curved bezier paths)
  let noiseLines = ""
  const lineCount = randomInt(4, 7)
  for (let i = 0; i < lineCount; i++) {
    const x1 = randomInt(0, 30)
    const y1 = randomInt(5, height - 5)
    const x2 = randomInt(width - 30, width)
    const y2 = randomInt(5, height - 5)
    const cx = randomInt(30, width - 30)
    const cy = randomInt(0, height)
    const stroke = noiseColors[randomInt(0, noiseColors.length)]
    const strokeWidth = (randomInt(10, 22) / 10).toFixed(1)
    const opacity = (randomInt(30, 60) / 100).toFixed(2)
    noiseLines += `<path d="M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}" stroke="${stroke}" stroke-width="${strokeWidth}" fill="none" opacity="${opacity}" />`
  }

  // Generate background noise dots
  let noiseDots = ""
  const dotCount = randomInt(35, 50)
  for (let i = 0; i < dotCount; i++) {
    const cx = randomInt(3, width - 3)
    const cy = randomInt(3, height - 3)
    const r = (randomInt(10, 22) / 10).toFixed(1)
    const fill = noiseColors[randomInt(0, noiseColors.length)]
    const opacity = (randomInt(25, 55) / 100).toFixed(2)
    noiseDots += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" opacity="${opacity}" />`
  }

  // Generate characters with offsets, font sizes, colors, and angles (-20 to +20 deg)
  const len = code.length
  const horizontalPadding = 18
  const usableWidth = width - horizontalPadding * 2
  const slotWidth = usableWidth / Math.max(1, len)

  let charsSvg = ""
  for (let i = 0; i < len; i++) {
    const char = code[i]
    const baseX = horizontalPadding + i * slotWidth + slotWidth / 2
    const jitterX = randomInt(0, 7) - 3 // -3 to +3
    const x = Math.round(baseX + jitterX)

    const baseY = height / 2
    const jitterY = randomInt(0, 7) - 3 // -3 to +3
    const y = Math.round(baseY + jitterY)

    const fontSize = randomInt(26, 33)
    const angle = randomInt(0, 41) - 20 // -20 to +20 degrees
    const color = charColors[randomInt(0, charColors.length)]

    // Safe XML text rendering
    const safeChar =
      char === "<"
        ? "&lt;"
        : char === ">"
          ? "&gt;"
          : char === "&"
            ? "&amp;"
            : char

    charsSvg += `<text x="${x}" y="${y}" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="${fontSize}" font-weight="bold" fill="${color}" text-anchor="middle" dominant-baseline="central" transform="rotate(${angle}, ${x}, ${y})">${safeChar}</text>`
  }

  // Generate 1-2 foreground strike-through noise lines
  let fgLines = ""
  const fgLineCount = randomInt(1, 3)
  for (let i = 0; i < fgLineCount; i++) {
    const yStart = randomInt(10, height - 10)
    const yEnd = randomInt(10, height - 10)
    const c1 = randomInt(5, height - 5)
    const c2 = randomInt(5, height - 5)
    const stroke = noiseColors[randomInt(0, noiseColors.length)]
    fgLines += `<path d="M 0 ${yStart} C ${Math.round(width * 0.3)} ${c1}, ${Math.round(width * 0.7)} ${c2}, ${width} ${yEnd}" stroke="${stroke}" stroke-width="1.6" fill="none" opacity="0.45" />`
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" aria-label="Captcha security code"><rect width="100%" height="100%" fill="#f8fafc" rx="6"/><rect width="100%" height="100%" fill="none" stroke="#e2e8f0" stroke-width="1.5" rx="6"/>${noiseLines}${noiseDots}${charsSvg}${fgLines}</svg>`
}

/**
 * Sign a base64url payload with HMAC-SHA256.
 */
function signPayload(payloadB64: string, secret: string): string {
  return createHmac("sha256", secret).update(payloadB64).digest("base64url")
}

/**
 * Generate a new Captcha token and SVG.
 */
export function generateCaptcha(
  options?: GenerateCaptchaOptions
): CaptchaResult {
  const code = (options?.text || generateRandomCode()).toUpperCase()
  const width = options?.width || 160
  const height = options?.height || 50
  const expiresInMs =
    typeof options?.expiresInMs === "number"
      ? options.expiresInMs
      : DEFAULT_CAPTCHA_EXPIRY_MS

  const exp = Date.now() + expiresInMs
  const nonce = randomBytes(8).toString("hex")

  const payload: CaptchaPayload = {
    text: code.toLowerCase(),
    exp,
    nonce,
  }

  const payloadB64 = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url"
  )
  const secret = getSecretKey()
  const signature = signPayload(payloadB64, secret)
  const token = `${payloadB64}.${signature}`

  const rawSvg = generateCaptchaSvg(code, width, height)
  const svg = `data:image/svg+xml;utf8,${encodeURIComponent(rawSvg)}`

  return {
    token,
    svg,
    rawSvg,
  }
}

/**
 * Verify a captcha token against the user's provided answer.
 * Includes HMAC integrity, expiration check, constant-time comparison, and replay protection.
 */
export function verifyCaptcha(
  token: string,
  answer: string
): VerifyCaptchaResult {
  if (typeof token !== "string" || !token.trim()) {
    return { success: false, error: "Missing or invalid captcha token" }
  }

  if (typeof answer !== "string" || !answer.trim()) {
    return { success: false, error: "Missing or empty captcha answer" }
  }

  const parts = token.split(".")
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return { success: false, error: "Malformed captcha token" }
  }

  const [payloadB64, signature] = parts
  const secret = getSecretKey()

  // 1. Verify HMAC signature using crypto.timingSafeEqual
  const expectedSignature = signPayload(payloadB64, secret)
  const signatureBuf = Buffer.from(signature, "utf8")
  const expectedSignatureBuf = Buffer.from(expectedSignature, "utf8")

  if (
    signatureBuf.length !== expectedSignatureBuf.length ||
    !timingSafeEqual(signatureBuf, expectedSignatureBuf)
  ) {
    return { success: false, error: "Invalid captcha signature" }
  }

  // 2. Decode and validate payload structure
  let payload: CaptchaPayload
  try {
    const jsonStr = Buffer.from(payloadB64, "base64url").toString("utf8")
    payload = JSON.parse(jsonStr)
  } catch {
    return { success: false, error: "Invalid captcha payload encoding" }
  }

  if (
    !payload ||
    typeof payload.text !== "string" ||
    typeof payload.exp !== "number" ||
    typeof payload.nonce !== "string"
  ) {
    return { success: false, error: "Invalid captcha payload structure" }
  }

  // 3. Expiration check
  if (Date.now() > payload.exp) {
    return { success: false, error: "Captcha has expired" }
  }

  // 4. Replay protection check
  if (nonceStore.has(payload.nonce)) {
    return { success: false, error: "Captcha token has already been used" }
  }

  // 5. Record nonce immediately to prevent replay attacks and brute-force guessing
  nonceStore.add(payload.nonce, payload.exp)

  // 6. Constant-time equality comparison between user answer and signed code
  const normalizedAnswer = answer.trim().toLowerCase()
  const normalizedExpected = payload.text.trim().toLowerCase()

  const answerHash = createHash("sha256").update(normalizedAnswer).digest()
  const expectedHash = createHash("sha256").update(normalizedExpected).digest()

  if (!timingSafeEqual(answerHash, expectedHash)) {
    return { success: false, error: "Incorrect captcha answer" }
  }

  return { success: true }
}
