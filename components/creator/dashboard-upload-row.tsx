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
        <div className="flex items-center gap-3">
          {upload.slug && (
            <button
              type="button"
              onClick={() => void togglePlay()}
              aria-label={`${playing ? "Pause" : "Play"} ${upload.title}`}
              className={`flex size-9 shrink-0 items-center justify-center rounded-xl border transition-all active:scale-95 sm:size-8 ${
                playing
                  ? "border-indigo-600 bg-indigo-600 text-white shadow-xs"
                  : "border-border/80 bg-secondary/60 text-muted-foreground hover:border-indigo-500/40 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-400"
              }`}
            >
              {playing ? (
                <Pause className="size-3.5 fill-current" />
              ) : (
                <Play className="size-3.5 fill-current pl-0.5" />
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
            className="inline-flex min-h-[36px] items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-50 hover:text-indigo-500 active:scale-95 dark:text-indigo-400 dark:hover:bg-indigo-950/40"
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

export function DashboardUploadCard({
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
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-card p-3 shadow-xs">
      <div className="flex min-w-0 items-center gap-3">
        {upload.slug && (
          <button
            type="button"
            onClick={() => void togglePlay()}
            aria-label={`${playing ? "Pause" : "Play"} ${upload.title}`}
            className={`flex size-10 shrink-0 items-center justify-center rounded-xl border transition-all active:scale-95 ${
              playing
                ? "border-indigo-600 bg-indigo-600 text-white shadow-xs"
                : "border-border/80 bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            {playing ? (
              <Pause className="size-4 fill-current" />
            ) : (
              <Play className="size-4 fill-current pl-0.5" />
            )}
          </button>
        )}

        <div className="min-w-0">
          <Link
            href={upload.slug ? `/sound/${upload.slug}` : "#"}
            className="line-clamp-1 text-xs font-semibold text-foreground hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            {upload.title}
          </Link>
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="py-0.2 rounded bg-secondary px-1.5 text-[10px] font-medium">
              {upload.categoryName || "General"}
            </span>
            {duration && <span className="font-mono">{duration}</span>}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <Badge
          variant={statusVariant}
          className="gap-1 px-2 py-0.5 text-[10px] capitalize"
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
              : "Review"}
        </Badge>

        {upload.status === "published" && upload.slug && (
          <Link
            href={`/sound/${upload.slug}`}
            className="inline-flex min-h-[32px] items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
          >
            <span>View</span>
            <ExternalLink className="size-3" />
          </Link>
        )}
      </div>

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
    </div>
  )
}
