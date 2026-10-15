"use client"

import { useEffect, useState, useSyncExternalStore } from "react"
import { Download } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>
}

const installDismissedKey = "dhonn-pwa-install-dismissed-until"
const installDismissalDuration = 24 * 60 * 60 * 1000
let appInstalled = false

function isStandalone() {
  return (
    appInstalled ||
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in window.navigator &&
      Boolean(
        (window.navigator as Navigator & { standalone?: boolean }).standalone
      ))
  )
}

function getDismissedUntil() {
  return Number(window.localStorage.getItem(installDismissedKey)) || 0
}

function isInstallSnoozed() {
  return getDismissedUntil() > Date.now()
}

function subscribeToInstallDismissal(onChange: () => void) {
  let timer: number | undefined

  function scheduleExpiration() {
    if (timer !== undefined) window.clearTimeout(timer)

    const dismissedUntil = getDismissedUntil()
    if (dismissedUntil <= Date.now()) {
      timer = undefined
      return
    }

    timer = window.setTimeout(
      () => {
        timer = undefined
        onChange()
      },
      dismissedUntil - Date.now() + 1
    )
  }

  function handleDismissalChange() {
    onChange()
    scheduleExpiration()
  }

  function handleStorageChange(event: StorageEvent) {
    if (event.key === installDismissedKey) handleDismissalChange()
  }

  window.addEventListener("dhonn-install-dismissed", handleDismissalChange)
  window.addEventListener("storage", handleStorageChange)
  scheduleExpiration()

  return () => {
    window.removeEventListener("dhonn-install-dismissed", handleDismissalChange)
    window.removeEventListener("storage", handleStorageChange)
    if (timer !== undefined) window.clearTimeout(timer)
  }
}

function subscribeToInstallStatus(onChange: () => void) {
  const displayMode = window.matchMedia("(display-mode: standalone)")

  function handleAppInstalled() {
    appInstalled = true
    onChange()
  }

  window.addEventListener("appinstalled", handleAppInstalled)
  displayMode.addEventListener("change", onChange)

  return () => {
    window.removeEventListener("appinstalled", handleAppInstalled)
    displayMode.removeEventListener("change", onChange)
  }
}

export function PwaInstallButton() {
  const [open, setOpen] = useState(false)
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(
    null
  )
  const installed = useSyncExternalStore(
    subscribeToInstallStatus,
    isStandalone,
    () => false
  )
  const installSnoozed = useSyncExternalStore(
    subscribeToInstallDismissal,
    isInstallSnoozed,
    () => false
  )
  const [installAccepted, setInstallAccepted] = useState(false)
  const [installMessage, setInstallMessage] = useState("")

  useEffect(() => {
    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault()
      setInstallPrompt(event as InstallPromptEvent)
    }

    function handleAppInstalled() {
      setInstallPrompt(null)
      setOpen(false)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("appinstalled", handleAppInstalled)

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      )
      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [])

  async function handleInstall() {
    if (!installPrompt) {
      setInstallMessage(
        "This browser does not currently provide an install prompt."
      )
      return
    }

    try {
      await installPrompt.prompt()
      const choice = await installPrompt.userChoice
      setInstallPrompt(null)
      if (choice.outcome === "accepted") {
        setInstallAccepted(true)
        setOpen(false)
      } else {
        setInstallMessage("The install prompt was dismissed.")
      }
    } catch {
      setInstallPrompt(null)
      setInstallMessage(
        "This browser could not open the install prompt. Please try again later."
      )
    }
  }

  function handleInstallClick() {
    if (!installPrompt) {
      setInstallMessage(
        "This browser does not currently provide an install prompt."
      )
      return
    }

    setInstallMessage("")
    void handleInstall()
  }

  function dismissInstallDialog() {
    window.localStorage.setItem(
      installDismissedKey,
      String(Date.now() + installDismissalDuration)
    )
    window.dispatchEvent(new Event("dhonn-install-dismissed"))
    setOpen(false)
  }

  if (installed || installAccepted || installSnoozed) return null

  return (
    <>
      <Button
        className="fixed right-4 bottom-20 z-40 rounded-full shadow-xl shadow-sky-500/25 sm:right-6 sm:bottom-6 md:bottom-[calc(1rem+env(safe-area-inset-bottom))]"
        onClick={() => {
          setInstallMessage("")
          setOpen(true)
        }}
      >
        <Download aria-hidden="true" />
        Install app
      </Button>
      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (!nextOpen && open) {
            dismissInstallDialog()
            return
          }
          setOpen(nextOpen)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Take dhonn. with you</DialogTitle>
            <DialogDescription>
              Install dhonn. for quick access to your favorite sounds.
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Tap Install app to open your device&apos;s install prompt.
          </p>
          {installMessage && (
            <p role="status" className="text-sm text-muted-foreground">
              {installMessage}
            </p>
          )}
          <Button className="w-full" onClick={handleInstallClick}>
            <Download aria-hidden="true" />
            Install app
          </Button>
        </DialogContent>
      </Dialog>
    </>
  )
}
