"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  Check,
  Copy,
  Download,
  Heart,
  Pause,
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
  const [copied, setCopied] = useState(false)

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
      setMessage("Embed code copied.")
    } catch {
      setMessage("Copy failed. Please try again.")
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/sound/${encodeURIComponent(slug)}`
      )
      setCopied(true)
      setMessage("Sound link copied.")
      window.setTimeout(() => setCopied(false), 1800)
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
      className="mt-7 overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-lg shadow-slate-950/[0.04] dark:border-white/10 dark:bg-slate-900"
    >
      <div className="p-4 sm:p-5">
        {/* Seek bar */}
        <div className="space-y-2">
          <input
            type="range"
            min={0}
            max={duration || 1}
            step={0.1}
            value={Math.min(currentTime, duration || 0)}
            onChange={(event) => seek(Number(event.target.value))}
            aria-label="Seek audio"
            style={{
              background: `linear-gradient(to right, #3b82f6 ${progress}%, rgb(148 163 184 / 25%) ${progress}%)`,
            }}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full accent-blue-600 [&::-webkit-slider-thumb]:size-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:shadow-md"
          />

          <div className="flex justify-between text-xs font-medium text-slate-500 tabular-nums dark:text-slate-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Main controls */}
        <div className="mt-5 flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => seek(0)}
            aria-label="Restart audio"
            className="size-10 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-white/[0.06]"
          >
            <RotateCcw className="size-[18px]" />
          </Button>

          {/* 3D play button */}
          <button
            type="button"
            onClick={() => void togglePlayback()}
            aria-label={`${playing ? "Stop" : "Play"} ${title}`}
            aria-pressed={playing}
            className="group/play relative size-[94px] shrink-0 cursor-pointer rounded-full bg-blue-50 shadow-[inset_0_0_1px_1px_rgba(0,0,0,0.3),2px_3px_5px_rgba(0,0,0,0.1)] transition-transform active:scale-95 dark:bg-slate-800"
          >
            <span className="absolute top-[5px] left-1/2 size-[83px] -translate-x-1/2 rounded-full bg-black blur-[1px]" />

            <span className="absolute top-[5px] left-1/2 z-10 flex size-[83px] -translate-x-1/2 items-center justify-center rounded-full bg-gradient-to-b from-blue-600 to-blue-400 shadow-[inset_0_4px_2px_#60a5fa,inset_0_-4px_0_#1e3a8a,0_0_2px_rgba(0,0,0,0.1)] transition-all group-hover/play:brightness-110">
              {playing ? (
                <Pause className="size-9 fill-blue-100 text-blue-100 drop-shadow-md" />
              ) : (
                <Play className="ml-1 size-9 fill-blue-100 text-blue-100 drop-shadow-md" />
              )}
            </span>
          </button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              aria-label={volume === 0 ? "Unmute" : "Mute"}
              className="size-10 shrink-0 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-white/[0.06]"
            >
              <VolumeIcon className="size-[18px]" />
            </Button>

            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(event) => changeVolume(Number(event.target.value))}
              aria-label="Volume"
              className="hidden h-1.5 w-16 cursor-pointer accent-blue-600 sm:block"
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-5 grid grid-cols-2 gap-2 border-t border-slate-100 pt-4 sm:grid-cols-3 dark:border-white/[0.08]">
          <ShareSoundButton slug={slug} title={title} shareText={true} />

          <Button
            type="button"
            variant="outline"
            onClick={() => void toggleFavorite(id)}
            aria-pressed={favorite}
            className={`h-10 rounded-xl ${
              favorite
                ? "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-300"
                : "border-slate-200 bg-white text-slate-600 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 dark:border-white/10 dark:bg-slate-800 dark:text-slate-300"
            }`}
          >
            <Heart className={`size-4 ${favorite ? "fill-current" : ""}`} />
            {favorite ? "Saved" : "Favorite"}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => void copyLink()}
            className="h-10 rounded-xl border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 dark:border-white/10 dark:bg-slate-800 dark:text-slate-300"
          >
            {copied ? (
              <Check className="size-4 text-emerald-500" />
            ) : (
              <Copy className="size-4" />
            )}
            {copied ? "Copied" : "Copy link"}
          </Button>

          <Link
            href={`/api/sounds/${encodeURIComponent(slug)}/audio?download=1`}
            download
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition-colors hover:border-blue-200 hover:bg-blue-50 dark:border-white/10 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <Download className="size-4" />
            Download
          </Link>

          <Button
            type="button"
            variant="outline"
            onClick={() => void copyEmbed()}
            className="h-10 rounded-xl border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 dark:border-white/10 dark:bg-slate-800 dark:text-slate-300"
          >
            <Copy className="size-4" />
            Copy embed
          </Button>
        </div>

        {(message || error) && (
          <p
            role="status"
            className="mt-3 text-xs text-sky-700 dark:text-sky-300"
          >
            {error || message}
          </p>
        )}
      </div>

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
