"use client"

import { useEffect, useRef, useState } from "react"

function checkIsStandalone(): boolean {
  if (typeof window === "undefined") return false

  const isMediaStandalone = window.matchMedia(
    "(display-mode: standalone)"
  ).matches
  const isNavigatorStandalone = Boolean(
    (window.navigator as Navigator & { standalone?: boolean }).standalone
  )

  return isMediaStandalone || isNavigatorStandalone
}

export function PwaSplashScreen() {
  const [phase, setPhase] = useState<"idle" | "active" | "exiting" | "done">(
    "idle"
  )
  const [reducedMotion, setReducedMotion] = useState(false)
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // Only show in standalone / installed PWA mode
    if (!checkIsStandalone()) {
      return
    }

    // Only play once per app launch session
    const sessionKey = "dhonn-pwa-launched"
    try {
      if (window.sessionStorage.getItem(sessionKey)) {
        return
      }
      window.sessionStorage.setItem(sessionKey, "1")
    } catch {
      return
    }

    const isReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches

    const holdDuration = isReduced ? 150 : 500
    const exitDuration = isReduced ? 150 : 400

    const animTimer = setTimeout(() => {
      setReducedMotion(isReduced)
      setPhase("active")
    }, 0)

    holdTimerRef.current = setTimeout(() => {
      setPhase("exiting")

      exitTimerRef.current = setTimeout(() => {
        setPhase("done")
      }, exitDuration)
    }, holdDuration)

    return () => {
      clearTimeout(animTimer)
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current)
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current)
    }
  }, [])

  if (phase === "idle" || phase === "done") {
    return null
  }

  const isExiting = phase === "exiting"

  return (
    <div
      aria-hidden="true"
      role="presentation"
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden bg-white select-none dark:bg-[#09090b] ${
        isExiting
          ? reducedMotion
            ? "pointer-events-none opacity-0 transition-opacity duration-150 ease-out"
            : "pointer-events-none scale-[1.03] opacity-0 transition-all duration-400 ease-out"
          : "scale-100 opacity-100 transition-transform duration-300 ease-out"
      }`}
    >
      <div className="relative flex flex-col items-center justify-center">
        {/* Subtle ambient glow & pulse ring */}
        {!reducedMotion && (
          <>
            <div className="absolute -inset-8 animate-pulse rounded-full bg-indigo-500/10 blur-2xl" />
            <div className="absolute -inset-3 animate-ping rounded-2xl border border-indigo-500/15 opacity-60 [animation-duration:2.5s]" />
          </>
        )}

        {/* Brand Logo with Glowing Dot */}
        <div className="relative flex items-baseline font-heading text-4xl font-extrabold tracking-tight text-foreground select-none sm:text-5xl">
          <span>dhonn</span>
          <span className="relative ml-0.5 inline-block text-indigo-600 dark:text-indigo-400">
            .
            {!reducedMotion && (
              <span
                className="pointer-events-none absolute inset-0 animate-pulse rounded-full bg-indigo-500/60 blur-[6px]"
                aria-hidden="true"
              />
            )}
          </span>
        </div>

        {/* Audio Waveform Equalizer */}
        <div
          className="relative mt-4 flex h-6 w-16 items-center justify-center gap-1.5"
          aria-hidden="true"
        >
          <span className="animate-soundwave-1 h-full w-1 rounded-full bg-indigo-600 dark:bg-indigo-400" />
          <span className="animate-soundwave-2 h-full w-1 rounded-full bg-indigo-600 dark:bg-indigo-400" />
          <span className="animate-soundwave-3 h-full w-1 rounded-full bg-indigo-600 dark:bg-indigo-400" />
          <span className="animate-soundwave-4 h-full w-1 rounded-full bg-indigo-600 dark:bg-indigo-400" />
          <span className="animate-soundwave-5 h-full w-1 rounded-full bg-indigo-600 dark:bg-indigo-400" />
        </div>
      </div>
    </div>
  )
}
