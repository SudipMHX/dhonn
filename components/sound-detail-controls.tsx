"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  Check,
  Code,
  Copy,
  Download,
  Heart,
  Play,
  RotateCcw,
  Volume1,
  Volume2,
  VolumeX,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { useFavorites } from "@/components/favorite-provider"
import { ShareSoundButton } from "@/components/share-sound-button"
import Link from "next/link"

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00"
  const total = Math.floor(seconds)
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`
}

export function SoundDetailControls({
  id,
  slug,
  title,
}: {
  id: string
  slug: string
  title: string
}) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const { favorites, toggleFavorite, error } = useFavorites()

  const [message, setMessage] = useState("")
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [previousVolume, setPreviousVolume] = useState(1)
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedEmbed, setCopiedEmbed] = useState(false)

  const favorite = favorites.has(id)
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  const stopPlayback = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.pause()
    audio.currentTime = 0
    setCurrentTime(0)
    setPlaying(false)
  }, [])

  useEffect(() => {
    function stopOtherAudio(event: Event) {
      const activeAudio = (event as CustomEvent<HTMLAudioElement>).detail

      if (activeAudio !== audioRef.current) {
        stopPlayback()
      }
    }

    window.addEventListener("dhonn.:audio-started", stopOtherAudio)
    return () =>
      window.removeEventListener("dhonn.:audio-started", stopOtherAudio)
  }, [stopPlayback])

  async function togglePlayback() {
    const audio = audioRef.current
    if (!audio) return

    setMessage("")

    if (!audio.paused) {
      audio.pause()
      audio.currentTime = 0
      setCurrentTime(0)
      return
    }

    window.dispatchEvent(
      new CustomEvent<HTMLAudioElement>("dhonn.:audio-started", {
        detail: audio,
      })
    )

    try {
      await audio.play()
    } catch {
      setMessage("Unable to play this sound. Please try again.")
    }
  }

  function seek(value: number) {
    const audio = audioRef.current
    if (!audio || !Number.isFinite(audio.duration)) return

    audio.currentTime = value
    setCurrentTime(value)
  }

  function changeVolume(value: number) {
    const next = Math.min(1, Math.max(0, value))
    setVolume(next)

    if (next > 0) setPreviousVolume(next)
    if (audioRef.current) audioRef.current.volume = next
  }

  function toggleMute() {
    changeVolume(volume > 0 ? 0 : previousVolume || 1)
  }

  async function copyEmbed() {
    const code = `<iframe src="${window.location.origin}/embed/${encodeURIComponent(slug)}" title="${title.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")}" width="360" height="110" allow="autoplay"></iframe>`

    try {
      await navigator.clipboard.writeText(code)
      setCopiedEmbed(true)
      setMessage("Embed snippet copied to clipboard.")
      window.setTimeout(() => setCopiedEmbed(false), 2000)
    } catch {
      setMessage("Copy failed. Please try again.")
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/sound/${encodeURIComponent(slug)}`
      )
      setCopiedLink(true)
      setMessage("Sound link copied to clipboard.")
      window.setTimeout(() => setCopiedLink(false), 2000)
    } catch {
      setMessage("Could not copy the sound link.")
    }
  }

  function recordPlay() {
    void fetch(`/api/sounds/${encodeURIComponent(slug)}/play`, {
      method: "POST",
    })
      .then((response) => {
        if (!response.ok) console.warn("Playback analytics were not recorded.")
      })
      .catch(() => console.warn("Playback analytics request failed."))
  }

  const VolumeIcon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2

  return (
    <section
      aria-label="Sound playback controls"
      className="mt-6 overflow-hidden rounded-2xl border border-border/80 bg-card p-5 sm:p-7 shadow-xs"
    >
      {/* Visual Scrubber Timeline */}
      <div className="space-y-2.5">
        <div className="relative">
          <input
            type="range"
            min={0}
            max={duration || 1}
            step={0.05}
            value={Math.min(currentTime, duration || 0)}
            onChange={(event) => seek(Number(event.target.value))}
            aria-label="Seek audio"
            style={{
              background: `linear-gradient(to right, #6366f1 ${progress}%, var(--secondary) ${progress}%)`,
            }}
            className="h-2 w-full cursor-pointer appearance-none rounded-full accent-indigo-600 transition-all [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-indigo-600 [&::-webkit-slider-thumb]:shadow-md dark:[&::-webkit-slider-thumb]:border-neutral-900"
          />
        </div>

        <div className="flex justify-between text-xs font-mono font-medium text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Main Playback Bar */}
      <div className="mt-6 flex items-center justify-between gap-4">
        {/* Restart Button */}
        <button
          type="button"
          onClick={() => seek(0)}
          aria-label="Restart audio"
          className="flex size-10 items-center justify-center rounded-xl border border-border/70 bg-secondary/50 text-muted-foreground transition-all hover:bg-secondary hover:text-foreground"
        >
          <RotateCcw className="size-4" />
        </button>

        {/* Central Tactile Play Disc */}
        <button
          type="button"
          onClick={() => void togglePlayback()}
          aria-label={`${playing ? "Stop" : "Play"} ${title}`}
          aria-pressed={playing}
          className={`relative flex size-20 items-center justify-center rounded-2xl transition-all duration-300 active:scale-95 ${
            playing
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-4 ring-indigo-500/20"
              : "border border-border/80 bg-foreground text-background shadow-md hover:bg-foreground/90 hover:scale-105"
          }`}
        >
          {playing ? (
            <div className="flex items-end gap-1.5 h-6" aria-hidden="true">
              <span className="w-1.5 rounded-full bg-white animate-soundwave-1" />
              <span className="w-1.5 rounded-full bg-white animate-soundwave-2" />
              <span className="w-1.5 rounded-full bg-white animate-soundwave-3" />
              <span className="w-1.5 rounded-full bg-white animate-soundwave-4" />
              <span className="w-1.5 rounded-full bg-white animate-soundwave-5" />
            </div>
          ) : (
            <Play className="ml-1 size-8 fill-current" />
          )}
        </button>

        {/* Volume Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleMute}
            aria-label={volume === 0 ? "Unmute" : "Mute"}
            className="flex size-10 items-center justify-center rounded-xl border border-border/70 bg-secondary/50 text-muted-foreground transition-all hover:bg-secondary hover:text-foreground"
          >
            <VolumeIcon className="size-4" />
          </button>

          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(event) => changeVolume(Number(event.target.value))}
            aria-label="Volume"
            className="hidden h-1.5 w-20 cursor-pointer accent-indigo-600 sm:block"
          />
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="mt-8 grid grid-cols-2 gap-2.5 border-t border-border/60 pt-6 sm:grid-cols-5">
        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={() => void toggleFavorite(id)}
          aria-pressed={favorite}
          className={`rounded-xl border ${
            favorite
              ? "border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-400"
              : "border-border/80 bg-secondary/40 text-foreground"
          }`}
        >
          <Heart className={`size-4 ${favorite ? "fill-current" : ""}`} />
          <span>{favorite ? "Favorited" : "Favorite"}</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={() => void copyLink()}
          className="rounded-xl border border-border/80 bg-secondary/40 text-foreground"
        >
          {copiedLink ? (
            <Check className="size-4 text-emerald-500" />
          ) : (
            <Copy className="size-4" />
          )}
          <span>{copiedLink ? "Copied" : "Copy Link"}</span>
        </Button>

        <ShareSoundButton
          slug={slug}
          title={title}
          shareText={true}
          className="rounded-xl border border-border/80 bg-secondary/40 text-foreground"
        />

        <Link
          href={`/api/sounds/${encodeURIComponent(slug)}/audio?download=1`}
          download
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border/80 bg-secondary/40 px-4 text-sm font-medium text-foreground transition-colors hover:bg-secondary active:bg-secondary/70"
        >
          <Download className="size-4" />
          <span>Download</span>
        </Link>

        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={() => void copyEmbed()}
          className="rounded-xl border border-border/80 bg-secondary/40 text-foreground col-span-2 sm:col-span-1"
        >
          {copiedEmbed ? (
            <Check className="size-4 text-emerald-500" />
          ) : (
            <Code className="size-4" />
          )}
          <span>{copiedEmbed ? "Copied" : "Embed"}</span>
        </Button>
      </div>

      {(message || error) && (
        <div
          role="status"
          className="mt-4 rounded-xl border border-indigo-200/60 bg-indigo-50/50 p-3 text-center text-xs font-medium text-indigo-700 dark:border-indigo-900/50 dark:bg-indigo-950/30 dark:text-indigo-300"
        >
          {error || message}
        </div>
      )}

      <audio
        ref={audioRef}
        preload="metadata"
        src={`/api/sounds/${encodeURIComponent(slug)}/audio`}
        aria-label={`Play ${title}`}
        onLoadedMetadata={(event) =>
          setDuration(event.currentTarget.duration || 0)
        }
        onDurationChange={(event) =>
          setDuration(event.currentTarget.duration || 0)
        }
        onTimeUpdate={(event) =>
          setCurrentTime(event.currentTarget.currentTime)
        }
        onPlay={() => {
          setPlaying(true)
          recordPlay()
        }}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false)
          setCurrentTime(0)
        }}
        onError={() => {
          setPlaying(false)
          setMessage("Audio is currently unavailable.")
        }}
      />
    </section>
  )
}
