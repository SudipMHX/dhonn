"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { ExternalLink, Pause, Play } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { TableCell, TableRow } from "@/components/ui/table"

export type DashboardUploadItem = {
  _id: string
  title: string
  slug: string
  categoryName?: string
  status: string
  moderationNote?: string
  createdAt?: string
  audio?: { durationSeconds?: number }
}

export function DashboardUploadRow({
  upload,
}: {
  upload: DashboardUploadItem
}) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    function stopOtherAudio(event: Event) {
      if (event.target !== audioRef.current) {
        audioRef.current?.pause()
        if (audioRef.current) audioRef.current.currentTime = 0
        setPlaying(false)
      }
    }
    window.addEventListener("dhonn.:audio-started", stopOtherAudio)
    return () =>
      window.removeEventListener("dhonn.:audio-started", stopOtherAudio)
  }, [])

  async function togglePlay() {
    const audioEl = audioRef.current
    if (!audioEl) return
    if (playing) {
      audioEl.pause()
      audioEl.currentTime = 0
      setPlaying(false)
      return
    }
    window.dispatchEvent(new Event("dhonn.:audio-started"))
    try {
      await audioEl.play()
    } catch {
      setPlaying(false)
    }
  }

  const statusVariant =
    upload.status === "published"
      ? "success"
      : upload.status === "rejected"
        ? "destructive"
        : "warning"

  const duration = upload.audio?.durationSeconds
    ? `${upload.audio.durationSeconds.toFixed(1)}s`
    : null

  return (
    <TableRow className="group/row">
      {/* Sound title & inline audio auditioning */}
      <TableCell className="min-w-56 whitespace-normal">
        <div className="flex items-center gap-2.5">
          {upload.slug && (
            <button
              type="button"
              onClick={() => void togglePlay()}
              aria-label={`${playing ? "Pause" : "Play"} ${upload.title}`}
              className={`flex size-7 shrink-0 items-center justify-center rounded-lg border transition-all ${
                playing
                  ? "border-indigo-600 bg-indigo-600 text-white shadow-xs"
                  : "border-border/80 bg-secondary/60 text-muted-foreground hover:border-indigo-500/40 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-400"
              }`}
            >
              {playing ? (
                <Pause className="size-3 fill-current" />
              ) : (
                <Play className="size-3 fill-current pl-0.5" />
              )}
            </button>
          )}

          <div className="min-w-0">
            <Link
              href={upload.slug ? `/sound/${upload.slug}` : "#"}
              className="line-clamp-1 font-semibold text-foreground transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              {upload.title}
            </Link>
            {duration && (
              <span className="font-mono text-[10px] text-muted-foreground/80">
                {duration}
              </span>
            )}
          </div>
        </div>
      </TableCell>

      {/* Category */}
      <TableCell>
        <span className="rounded-md bg-secondary/80 px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {upload.categoryName || "Uncategorized"}
        </span>
      </TableCell>

      {/* Status */}
      <TableCell>
        <Badge
          variant={statusVariant}
          className="gap-1.5 text-[11px] capitalize"
        >
          <span
            className={`size-1.5 rounded-full ${
              upload.status === "published"
                ? "bg-emerald-500"
                : upload.status === "rejected"
                  ? "bg-rose-500"
                  : "bg-amber-500"
            }`}
          />
          {upload.status === "published"
            ? "Published"
            : upload.status === "rejected"
              ? "Rejected"
              : "Pending Review"}
        </Badge>
      </TableCell>

      {/* View Link */}
      <TableCell className="text-right">
        {upload.status === "published" && upload.slug ? (
          <Link
            href={`/sound/${upload.slug}`}
            className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400"
          >
            <span>View</span>
            <ExternalLink className="size-3" />
          </Link>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </TableCell>

      {upload.slug && (
        <audio
          ref={audioRef}
          src={`/api/sounds/${encodeURIComponent(upload.slug)}/audio`}
          preload="none"
          onEnded={() => setPlaying(false)}
          onPause={() => setPlaying(false)}
          onPlay={() => setPlaying(true)}
          onError={() => setPlaying(false)}
        />
      )}
    </TableRow>
  )
}
