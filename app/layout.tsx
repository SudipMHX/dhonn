import type { Metadata } from "next"
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

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL ?? "http://localhost:3000"),
  title: {
    default: "dhonn. | Little sounds, big reactions",
    template: "%s | dhonn.",
  },
  description: "Discover, play, and share quick creator-made sounds.",
  icons: {
    apple: "/app-icon-192.png",
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
