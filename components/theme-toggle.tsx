"use client"

import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme()
  const currentTheme = resolvedTheme ?? theme

  return (
    <Button
      type="button"
      onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
      variant="outline"
      size="icon"
      className="h-10 w-10 rounded-full p-0 text-lg"
      aria-label="Toggle color theme"
    >
      <span className="hidden dark:inline" aria-hidden="true">
        <Sun />
      </span>
      <span className="dark:hidden" aria-hidden="true">
        <Moon />
      </span>
    </Button>
  )
}
