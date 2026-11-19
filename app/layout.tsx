import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { FavoriteProvider } from "@/components/favorite-provider"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Toaster } from "@/components/ui/sonner"
import { auth } from "@/lib/auth"
import { PwaInstallButton } from "@/components/pwa-install-button"
import { ServiceWorkerRegistration } from "@/components/service-worker-registration"
import { PwaSplashScreen } from "@/components/pwa-splash-screen"

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
}

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL ?? "http://localhost:3000"),
  title: {
    default: "dhonn. | Little sounds, big reactions",
    template: "%s | dhonn.",
  },
  description: "Discover, play, and share quick creator-made sounds.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/app-icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/app-icon-192.png", sizes: "192x192", type: "image/png" }],
    shortcut: "/favicon.ico",
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth()

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased`}
    >
      <body className="min-h-screen pb-[calc(4.5rem+env(safe-area-inset-bottom))] antialiased md:pb-0">
        <ThemeProvider>
          <PwaSplashScreen />
          <SiteHeader user={session?.user ?? null} />
          <FavoriteProvider>{children}</FavoriteProvider>
          <SiteFooter />
          <PwaInstallButton />
          <ServiceWorkerRegistration />
          <Toaster position="top-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  )
}
