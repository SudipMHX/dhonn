"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"

function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      <ThemeHotkey />
      <ThemeColorSync />
      {children}
    </NextThemesProvider>
  )
}

function ThemeColorSync() {
  const { resolvedTheme } = useTheme()

  React.useEffect(() => {
    if (!resolvedTheme) return

    const isDark = resolvedTheme === "dark"
    const color = isDark ? "#09090b" : "#ffffff"
    const themeName = isDark ? "dark" : "light"

    // Synchronize meta[name="theme-color"] dynamically for browser chrome/mobile view
    const metas = document.querySelectorAll<HTMLMetaElement>(
      'meta[name="theme-color"]'
    )
    if (metas.length > 0) {
      metas.forEach((meta) => {
        meta.setAttribute("content", color)
      })
    } else {
      const meta = document.createElement("meta")
      meta.name = "theme-color"
      meta.content = color
      document.head.appendChild(meta)
    }

    // Set cookie so that app/manifest.ts receives the user's explicit theme choice
    document.cookie = `theme=${themeName}; path=/; max-age=31536000; SameSite=Lax`
  }, [resolvedTheme])

  return null
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  )
}

function ThemeHotkey() {
  const { theme, resolvedTheme, setTheme } = useTheme()

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.repeat) {
        return
      }

      if (event.metaKey || event.ctrlKey || event.altKey) {
        return
      }

      if (event.key.toLowerCase() !== "d") {
        return
      }

      if (isTypingTarget(event.target)) {
        return
      }

      const currentTheme = resolvedTheme ?? theme
      setTheme(currentTheme === "dark" ? "light" : "dark")
    }

    window.addEventListener("keydown", onKeyDown)

    return () => {
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [theme, resolvedTheme, setTheme])

  return null
}

export { ThemeProvider }
