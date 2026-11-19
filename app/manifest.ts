import type { MetadataRoute } from "next"
import { cookies, headers } from "next/headers"

export const dynamic = "force-dynamic"

export function getManifestTheme(
  cookieTheme?: string | null,
  clientHintTheme?: string | null
): { themeColor: string; backgroundColor: string } {
  // Determine dark or light mode.
  // Default to dark (#09090b) unless explicitly light or requested via Client Hint
  const isLight =
    cookieTheme === "light" || (!cookieTheme && clientHintTheme === "light")

  return {
    themeColor: isLight ? "#ffffff" : "#09090b",
    backgroundColor: isLight ? "#ffffff" : "#09090b",
  }
}

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const cookieStore = await cookies()
  const headerStore = await headers()

  const cookieTheme = cookieStore.get("theme")?.value
  const clientHintTheme = headerStore.get("sec-ch-prefers-color-scheme")

  const { themeColor, backgroundColor } = getManifestTheme(
    cookieTheme,
    clientHintTheme
  )

  return {
    name: "dhonn. | Little sounds, big reactions",
    short_name: "dhonn.",
    description: "Discover, play, and share quick creator-made sounds.",
    start_url: "/",
    display: "standalone",
    background_color: backgroundColor,
    theme_color: themeColor,
    icons: [
      {
        src: "/app-icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/app-icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/app-icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  }
}
