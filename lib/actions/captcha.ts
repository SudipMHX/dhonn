"use server"

import {
  generateCaptcha,
  verifyCaptcha,
  type CaptchaResult,
  type VerifyCaptchaResult,
} from "@/lib/captcha"

/**
 * Server action to generate a fresh captcha token and SVG.
 */
export async function getCaptchaAction(): Promise<{
  token: string
  svg: string
}> {
  const result: CaptchaResult = generateCaptcha()
  return {
    token: result.token,
    svg: result.svg,
  }
}

/**
 * Server action to verify a captcha response.
 */
export async function verifyCaptchaAction(
  token: string,
  answer: string
): Promise<VerifyCaptchaResult> {
  return verifyCaptcha(token, answer)
}
