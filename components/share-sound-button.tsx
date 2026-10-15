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
    const url = `${window.location.origin}/sound/${encodeURIComponent(slug)}`

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, url })
        toast.success("Sound shared.")
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return
        toast.error("This sound could not be shared.")
      }
      return
    }

    try {
      await navigator.clipboard.writeText(url)
      toast.success("Sound link copied.")
    } catch {
      toast.error("Could not copy the sound link.")
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
