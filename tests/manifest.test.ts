import assert from "node:assert/strict"
import test from "node:test"
import { getManifestTheme } from "../app/manifest.js"

test("manifest theme resolution defaults to dark when unspecified", () => {
  const { themeColor, backgroundColor } = getManifestTheme(null, null)
  assert.equal(themeColor, "#09090b")
  assert.equal(backgroundColor, "#09090b")
})

test("manifest theme resolution respects explicit cookie theme", () => {
  const light = getManifestTheme("light", "dark")
  assert.equal(light.themeColor, "#ffffff")
  assert.equal(light.backgroundColor, "#ffffff")

  const dark = getManifestTheme("dark", "light")
  assert.equal(dark.themeColor, "#09090b")
  assert.equal(dark.backgroundColor, "#09090b")
})

test("manifest theme resolution respects client hint header if cookie is absent", () => {
  const lightHint = getManifestTheme(null, "light")
  assert.equal(lightHint.themeColor, "#ffffff")
  assert.equal(lightHint.backgroundColor, "#ffffff")

  const darkHint = getManifestTheme(null, "dark")
  assert.equal(darkHint.themeColor, "#09090b")
  assert.equal(darkHint.backgroundColor, "#09090b")
})

test("theme colors are valid 6-char hex codes without alpha channel", () => {
  const hexRegex = /^#[0-9a-fA-F]{6}$/
  const dark = getManifestTheme("dark")
  const light = getManifestTheme("light")

  assert.match(dark.themeColor, hexRegex)
  assert.match(dark.backgroundColor, hexRegex)
  assert.match(light.themeColor, hexRegex)
  assert.match(light.backgroundColor, hexRegex)
})
