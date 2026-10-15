"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

export function ServiceWorkerRegistration() {
  const pathname = usePathname()

  useEffect(() => {
    if (
      process.env.NODE_ENV !== "production" ||
      !("serviceWorker" in navigator)
    ) {
      return
    }

    const reloadKey = "dhonn-service-worker-reload"
    let reloadTimer: number | undefined
    let handleControllerChange: (() => void) | undefined

    if (navigator.serviceWorker.controller) {
      window.sessionStorage.removeItem(reloadKey)
    } else if (window.sessionStorage.getItem(reloadKey) !== "pending") {
      window.sessionStorage.setItem(reloadKey, "pending")
      handleControllerChange = () => window.location.reload()
      navigator.serviceWorker.addEventListener(
        "controllerchange",
        handleControllerChange,
        { once: true },
      )
      reloadTimer = window.setTimeout(
        () => window.sessionStorage.removeItem(reloadKey),
        10000,
      )
    }

    void navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .catch((error: unknown) => {
        window.sessionStorage.removeItem(reloadKey)
        console.error("Service worker registration failed.", error)
      })

    const pageCacheTimer = window.setTimeout(() => {
      const urls = Array.from(
        document.querySelectorAll<HTMLAnchorElement>("a[href]"),
      )
        .map((link) => link.href)
        .filter((url) => new URL(url).pathname !== pathname)
        .filter((url, index, all) => all.indexOf(url) === index)
      navigator.serviceWorker.controller?.postMessage({
        type: "CACHE_PUBLIC_PAGES",
        urls,
      })
    }, 500)

    return () => {
      if (handleControllerChange) {
        navigator.serviceWorker.removeEventListener(
          "controllerchange",
          handleControllerChange,
        )
      }
      if (reloadTimer !== undefined) window.clearTimeout(reloadTimer)
      if (pageCacheTimer !== undefined) window.clearTimeout(pageCacheTimer)
    }
  }, [pathname])

  return null
}
