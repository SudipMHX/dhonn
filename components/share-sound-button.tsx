"use client"

import { Share2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"

export function ShareSoundButton({
  slug,
  title,
  shareText,
  className,
}: {
  slug: string
  title: string
  shareText: boolean
  className?: string
}) {
  async function shareSound() {
    const audioUrl = `/api/sounds/${encodeURIComponent(slug)}/audio`
    const downloadAudio = (url: string, filename?: string) => {
      const link = document.createElement("a")
      link.href = url
      if (filename) link.download = filename
      link.click()
    }

    if (typeof navigator.share !== "function") {
      downloadAudio(`${audioUrl}?download=1`)
      toast.info("Audio file sharing isn't supported. Downloading the audio.")
      return
    }

    try {
      const response = await fetch(audioUrl)
      if (!response.ok) throw new Error("Audio download failed.")

      const audio = await response.blob()
      const contentType =
        response.headers.get("content-type")?.split(";")[0] ||
        audio.type ||
        "audio/mpeg"
      const extension = contentType === "audio/wav" ? "wav" : "mp3"
      const file = new File([audio], `${slug}.${extension}`, {
        type: contentType,
      })

      if (
        typeof navigator.canShare === "function" &&
        !navigator.canShare({ files: [file] })
      ) {
        downloadAudio(`${audioUrl}?download=1`)
        toast.info("This device can't share audio files. Downloading the audio.")
        return
      }

      try {
        await navigator.share({ title, files: [file] })
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return
        if (!(error instanceof TypeError)) throw error

        downloadAudio(`${audioUrl}?download=1`)
        toast.info("This device can't share audio files. Downloading the audio.")
        return
      }

      toast.success("Audio file shared.")
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return
      toast.error("This audio file could not be shared.")
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={() => void shareSound()}
      className={`h-10 rounded-xl border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-100 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300 dark:hover:bg-emerald-400/20 ${className ?? ""}`}
      aria-label={`Share ${title}`}
      title={`Share ${title}`}
    >
      <Share2 className="size-4" aria-hidden="true" />
      {shareText && <span>Share</span>}
    </Button>
  )
}
