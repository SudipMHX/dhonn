"use client"

import Link from "next/link"
import { useCallback, useEffect, useRef, useState } from "react"
import { Check, Copy, Heart, Pause } from "lucide-react"

import { Button } from "@/components/ui/button"
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
      setPlayError("Could not copy the link. Please try again.")
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
      setPlayError("This sound could not be played. Please try again.")
    }
  }

  return (
    <article className="group relative flex min-h-60 flex-col items-center justify-center gap-5 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-sky-200 hover:shadow-xl hover:shadow-sky-950/5 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700">
      {/* Large 3D Play / Stop Button */}
      <button
        type="button"
        onClick={() => void togglePlayback()}
        aria-label={`${playing ? "Stop" : "Play"} ${sound.title}`}
        aria-pressed={playing}
        className="group/play relative size-[104px] shrink-0 cursor-pointer rounded-full bg-blue-50 shadow-[inset_0px_0px_1px_1px_rgba(0,0,0,0.3),2px_3px_5px_rgba(0,0,0,0.1)] transition-transform duration-200 active:scale-95 dark:bg-slate-800"
      >
        <span className="absolute top-[6px] left-1/2 size-[88px] -translate-x-1/2 rounded-full bg-black shadow-sm blur-[1px]" />

        <span className="absolute top-[6px] left-1/2 z-10 flex size-[88px] -translate-x-1/2 items-center justify-center rounded-full bg-gradient-to-b from-blue-600 to-blue-400 shadow-[inset_0_4px_2px_#60a5fa,inset_0_-4px_0_#1e3a8a,0_0_2px_rgba(0,0,0,0.1)] transition-all group-hover/play:brightness-110 group-active/play:shadow-[inset_0_4px_2px_rgba(96,165,250,0.5),inset_0_-4px_2px_rgba(37,99,235,0.5)]">
          {playing ? (
            <Pause
              className="size-9 fill-blue-100 text-blue-100 drop-shadow-md"
              strokeWidth={2.5}
            />
          ) : (
            <svg
              viewBox="0 0 24 24"
              className="ml-1 size-9 fill-blue-100 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]"
              aria-hidden="true"
            >
              <path d="M20.492 7.969 10.954.975A5 5 0 0 0 3 5.005V19a4.994 4.994 0 0 0 7.954 4.03l9.538-6.994a5 5 0 0 0 0-8.062Z" />
            </svg>
          )}
        </span>
      </button>

      {/* Sound Title */}
      <Link
        href={`/sound/${sound.slug}`}
        title={sound.title}
        className="line-clamp-2 w-full text-center text-base leading-snug font-semibold text-slate-900 transition-colors hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
      >
        {sound.title}
      </Link>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-2">
        <Button
          type="button"
          onClick={() => void toggleFavorite(sound._id)}
          aria-label={`${isFavorite ? "Remove from" : "Add to"} favorites`}
          aria-pressed={isFavorite}
          variant="outline"
          size="icon"
          className={`size-10 rounded-xl transition-colors ${
            isFavorite
              ? "border-rose-200 bg-rose-50 text-rose-500 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950"
              : "border-slate-200 bg-slate-50 text-slate-600 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          }`}
        >
          <Heart
            className={`size-[18px] ${isFavorite ? "fill-current" : ""}`}
          />
        </Button>

        <Button
          type="button"
          onClick={() => void copyLink()}
          aria-label="Copy sound link"
          variant="outline"
          size="icon"
          className="size-10 rounded-xl border-slate-200 bg-slate-50 text-slate-600 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          {copied ? (
            <Check className="size-[18px] text-emerald-500" />
          ) : (
            <Copy className="size-[18px]" />
          )}
        </Button>

        <ShareSoundButton
          slug={sound.slug}
          title={sound.title}
          shareText={false}
          className="size-10 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        />
      </div>

      {(playError || favoriteError) && (
        <p
          role="status"
          className="text-center text-xs text-rose-600 dark:text-rose-400"
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
