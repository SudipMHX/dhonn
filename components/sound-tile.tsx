"use client"

import Link from "next/link"
import { useCallback, useEffect, useRef, useState } from "react"
import { Check, Copy, Heart, Play, Volume2 } from "lucide-react"

import { useFavorites } from "@/components/favorite-provider"
import { ShareSoundButton } from "@/components/share-sound-button"

export type SoundCardData = {
  _id: string
  slug: string
  title: string
  description: string
  categoryName: string
  tags: string[]
  audio: { durationSeconds: number }
  plays: number
  favorites: number
}

function formatDuration(seconds: number) {
  if (!seconds || seconds <= 0) return "0s"
  if (seconds < 60) return `${Math.round(seconds)}s`
  const mins = Math.floor(seconds / 60)
  const rem = Math.round(seconds % 60)
  return `${mins}:${String(rem).padStart(2, "0")}`
}

export function SoundTile({ sound }: { sound: SoundCardData; index?: number }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [playError, setPlayError] = useState("")
  const [copied, setCopied] = useState(false)

  const { favorites, toggleFavorite, error: favoriteError } = useFavorites()
  const isFavorite = favorites.has(sound._id)

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/sound/${sound.slug}`
      )
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setPlayError("Could not copy the link.")
    }
  }, [sound.slug])

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

  async function togglePlayback() {
    const audio = audioRef.current
    if (!audio) return

    setPlayError("")

    if (playing) {
      audio.pause()
      audio.currentTime = 0
      setPlaying(false)
      return
    }

    window.dispatchEvent(new Event("dhonn.:audio-started"))

    try {
      await audio.play()
    } catch {
      setPlayError("Audio currently unavailable.")
    }
  }

  return (
    <article className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-card p-4 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/5">
      {/* Top Meta Bar */}
      <div className="flex items-center justify-between gap-2 text-xs">
        {sound.categoryName ? (
          <span className="truncate rounded-md bg-secondary px-2 py-0.5 font-medium text-muted-foreground transition-colors group-hover:text-foreground">
            {sound.categoryName}
          </span>
        ) : (
          <span />
        )}
        <span className="shrink-0 font-mono text-[11px] text-muted-foreground/80">
          {formatDuration(sound.audio?.durationSeconds)}
        </span>
      </div>

      {/* Central Play Trigger & Visualizer */}
      <div className="my-5 flex flex-col items-center justify-center">
        <button
          type="button"
          onClick={() => void togglePlayback()}
          aria-label={`${playing ? "Stop" : "Play"} ${sound.title}`}
          aria-pressed={playing}
          className={`relative flex size-18 items-center justify-center rounded-2xl transition-all duration-300 active:scale-95 ${
            playing
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-4 ring-indigo-500/20"
              : "border border-border/80 bg-secondary/60 text-foreground hover:border-indigo-500/30 hover:bg-indigo-50/50 hover:text-indigo-600 hover:shadow-sm dark:hover:bg-indigo-950/30 dark:hover:text-indigo-400"
          }`}
        >
          {playing ? (
            <div className="flex items-end gap-1 h-5" aria-hidden="true">
              <span className="w-1 rounded-full bg-white animate-soundwave-1" />
              <span className="w-1 rounded-full bg-white animate-soundwave-2" />
              <span className="w-1 rounded-full bg-white animate-soundwave-3" />
              <span className="w-1 rounded-full bg-white animate-soundwave-4" />
              <span className="w-1 rounded-full bg-white animate-soundwave-5" />
            </div>
          ) : (
            <Play className="size-7 fill-current pl-0.5 transition-transform duration-200 group-hover:scale-110" />
          )}
        </button>
      </div>

      {/* Title & Details */}
      <div className="mb-3 text-center">
        <Link
          href={`/sound/${sound.slug}`}
          title={sound.title}
          className="line-clamp-2 text-sm font-semibold tracking-tight text-foreground transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
        >
          {sound.title}
        </Link>
      </div>

      {/* Bottom Actions Bar */}
      <div className="flex items-center justify-between border-t border-border/50 pt-3">
        <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
          <Volume2 className="size-3 text-muted-foreground/70" />
          <span>{Number(sound.plays ?? 0).toLocaleString()}</span>
        </span>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => void toggleFavorite(sound._id)}
            aria-label={`${isFavorite ? "Remove from" : "Add to"} favorites`}
            aria-pressed={isFavorite}
            className={`flex size-8 items-center justify-center rounded-lg border transition-all ${
              isFavorite
                ? "border-rose-200 bg-rose-50 text-rose-500 dark:border-rose-900/60 dark:bg-rose-950/40"
                : "border-border/60 bg-transparent text-muted-foreground hover:border-rose-200 hover:bg-rose-50/50 hover:text-rose-500 dark:hover:border-rose-900/50 dark:hover:bg-rose-950/30"
            }`}
          >
            <Heart
              className={`size-3.5 transition-transform active:scale-125 ${
                isFavorite ? "fill-current" : ""
              }`}
            />
          </button>

          <button
            type="button"
            onClick={() => void copyLink()}
            aria-label="Copy sound link"
            className="flex size-8 items-center justify-center rounded-lg border border-border/60 bg-transparent text-muted-foreground transition-all hover:border-border hover:bg-secondary hover:text-foreground"
          >
            {copied ? (
              <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Copy className="size-3.5" />
            )}
          </button>

          <ShareSoundButton
            slug={sound.slug}
            title={sound.title}
            shareText={false}
            className="size-8 rounded-lg border border-border/60 bg-transparent p-0 text-muted-foreground hover:border-border hover:bg-secondary hover:text-foreground"
          />
        </div>
      </div>

      {(playError || favoriteError) && (
        <p
          role="status"
          className="mt-2 text-center text-xs text-rose-600 dark:text-rose-400"
        >
          {playError || favoriteError}
        </p>
      )}

      <audio
        ref={audioRef}
        src={`/api/sounds/${encodeURIComponent(sound.slug)}/audio`}
        preload="none"
        onPlay={() => {
          setPlaying(true)
          void fetch(`/api/sounds/${encodeURIComponent(sound.slug)}/play`, {
            method: "POST",
          }).catch(() => console.warn("Playback analytics request failed."))
        }}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onError={() => {
          setPlaying(false)
          setPlayError("Audio is currently unavailable.")
        }}
      />
    </article>
  )
}
