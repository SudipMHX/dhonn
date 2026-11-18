"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import {
  Check,
  Edit3,
  Flame,
  Heart,
  Pause,
  Play,
  Sparkles,
  Trash2,
  Volume2,
  X,
} from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TableCell, TableRow } from "@/components/ui/table"
import {
  adminChildRecord,
  adminText,
  type AdminMutation,
  type AdminRecord,
} from "./admin-data"
import { SoundEditForm } from "./sound-edit-form"
import type { SoundRemovalTarget } from "./sound-removal-dialog"
import { useAdminStore } from "./admin-store"

export function AdminSoundCard({
  row,
  allowPublish,
  mutate,
  onRemove,
}: {
  row: AdminRecord
  allowPublish: boolean
  mutate: AdminMutation
  onRemove: (target: SoundRemovalTarget) => void
}) {
  const id = adminText(row._id)
  const slug = adminText(row.slug)
  const owner = adminChildRecord(row.owner)
  const audio = adminChildRecord(row.audio)
  const editOpen = useAdminStore((state) => state.editingSoundId === id)
  const setEditingSoundId = useAdminStore((state) => state.setEditingSoundId)
  const initializeSoundDraft = useAdminStore(
    (state) => state.initializeSoundDraft
  )

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

  const status = adminText(row.status)
  const statusVariant =
    status === "published"
      ? "success"
      : status === "rejected" || status === "removed"
        ? "destructive"
        : "warning"

  const durationSec = Number(audio.durationSeconds) || 0
  const ownerName = adminText(owner.name) || "Anonymous"
  const ownerEmail = adminText(owner.email)
  const title = adminText(row.title)

  return (
    <TableRow className="group/row">
      {/* Sound title & audio preview trigger */}
      <TableCell className="max-w-xs min-w-64 whitespace-normal">
        <div className="flex items-start gap-3">
          {slug && (
            <button
              type="button"
              onClick={() => void togglePlay()}
              aria-label={`${playing ? "Pause" : "Play"} ${title}`}
              className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border transition-all ${
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

          <div className="min-w-0 flex-1">
            <Link
              href={slug ? `/sound/${slug}` : "#"}
              className="line-clamp-1 font-semibold text-foreground transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
              title={title}
            >
              {title}
            </Link>

            <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
              {Boolean(row.featured) && (
                <span className="py-0.2 inline-flex items-center gap-0.5 rounded border border-amber-200/50 bg-amber-50 px-1 font-medium text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/50 dark:text-amber-300">
                  <Sparkles className="size-2.5" /> Featured
                </span>
              )}
              {Boolean(row.trending) && (
                <span className="py-0.2 inline-flex items-center gap-0.5 rounded border border-indigo-200/50 bg-indigo-50 px-1 font-medium text-indigo-700 dark:border-indigo-900/50 dark:bg-indigo-950/50 dark:text-indigo-300">
                  <Flame className="size-2.5" /> Trending
                </span>
              )}
              {Boolean(row.categoryName) && (
                <span className="py-0.2 truncate rounded bg-secondary px-1.5 text-[10px] font-medium text-muted-foreground">
                  {adminText(row.categoryName)}
                </span>
              )}
            </div>
          </div>
        </div>
      </TableCell>

      {/* Creator */}
      <TableCell className="whitespace-normal">
        <div className="flex items-center gap-2">
          <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
            {ownerName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="line-clamp-1 text-xs font-medium text-foreground">
              {ownerName}
            </p>
            {ownerEmail && (
              <p className="line-clamp-1 font-mono text-[10px] text-muted-foreground">
                {ownerEmail}
              </p>
            )}
          </div>
        </div>
      </TableCell>

      {/* Status */}
      <TableCell>
        <Badge
          variant={statusVariant}
          className="gap-1.5 text-[11px] capitalize"
        >
          <span
            className={`size-1.5 rounded-full ${
              status === "published"
                ? "bg-emerald-500"
                : status === "rejected" || status === "removed"
                  ? "bg-rose-500"
                  : "bg-amber-500"
            }`}
          />
          {status === "published"
            ? "Published"
            : status === "rejected"
              ? "Rejected"
              : status === "pending"
                ? "Pending Review"
                : status || "Unknown"}
        </Badge>
      </TableCell>

      {/* Activity / Stats */}
      <TableCell className="font-mono text-xs text-muted-foreground">
        <div className="space-y-0.5">
          <div className="font-semibold text-foreground">
            {durationSec > 0 ? `${durationSec.toFixed(1)}s` : "0.0s"}
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <span
              className="inline-flex items-center gap-0.5"
              title="Total plays"
            >
              <Volume2 className="size-3 text-muted-foreground/70" />
              <span>{Number(row.plays ?? 0).toLocaleString()}</span>
            </span>
            <span
              className="inline-flex items-center gap-0.5"
              title="Favorites"
            >
              <Heart className="size-3 text-rose-500/70" />
              <span>{Number(row.favorites ?? 0).toLocaleString()}</span>
            </span>
          </div>
        </div>
      </TableCell>

      {/* Actions */}
      <TableCell className="min-w-64 whitespace-normal">
        <div className="flex flex-wrap items-center gap-1">
          {(allowPublish || row.status !== "published") &&
            row.status !== "rejected" &&
            row.status !== "removed" && (
              <Button
                type="button"
                onClick={() =>
                  void mutate("sound.update", id, {
                    status: "published",
                  })
                }
                variant="primary"
                size="xs"
                className="gap-1 rounded-lg"
              >
                <Check className="size-3" />
                <span>Publish</span>
              </Button>
            )}

          {row.status === "published" && (
            <Button
              type="button"
              onClick={() =>
                void mutate("sound.update", id, {
                  status: "pending",
                  moderationNote: "Unpublished by administrator.",
                })
              }
              variant="outline"
              size="xs"
              className="rounded-lg"
            >
              Unpublish
            </Button>
          )}

          {row.status !== "published" &&
            row.status !== "rejected" &&
            row.status !== "removed" && (
              <Button
                type="button"
                onClick={() =>
                  void mutate("sound.update", id, {
                    status: "rejected",
                    moderationNote: "Not approved by moderation.",
                  })
                }
                variant="destructive"
                size="xs"
                className="gap-1 rounded-lg"
              >
                <X className="size-3" />
                <span>Reject</span>
              </Button>
            )}

          <Button
            type="button"
            onClick={() =>
              void mutate("sound.update", id, {
                featured: !row.featured,
              })
            }
            variant="outline"
            size="xs"
            className={`rounded-lg ${row.featured ? "border-amber-300 bg-amber-50/50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300" : ""}`}
          >
            <Sparkles className="size-3" />
            <span>{row.featured ? "Featured" : "Feature"}</span>
          </Button>

          <Button
            type="button"
            onClick={() =>
              void mutate("sound.update", id, {
                trending: !row.trending,
              })
            }
            variant="outline"
            size="xs"
            className={`rounded-lg ${row.trending ? "border-indigo-300 bg-indigo-50/50 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300" : ""}`}
          >
            <Flame className="size-3" />
            <span>{row.trending ? "Trending" : "Trend"}</span>
          </Button>

          <Dialog
            open={editOpen}
            onOpenChange={(open) => {
              if (open) {
                initializeSoundDraft(id, {
                  title: adminText(row.title),
                  description: adminText(row.description),
                  tags: Array.isArray(row.tags) ? row.tags.join(", ") : "",
                })
              }
              setEditingSoundId(open ? id : null)
            }}
          >
            <DialogTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  className="rounded-lg"
                >
                  <Edit3 className="size-3" />
                  <span>Edit</span>
                </Button>
              }
            />
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit sound details</DialogTitle>
                <DialogDescription>
                  Update the title, description, and tags for this sound.
                </DialogDescription>
              </DialogHeader>
              <SoundEditForm
                key={`${id}-${editOpen}`}
                row={row}
                soundId={id}
                onSave={async (body) => {
                  const saved = await mutate("sound.update", id, {
                    ...body,
                  })
                  if (saved) setEditingSoundId(null)
                  return saved
                }}
              />
            </DialogContent>
          </Dialog>

          <Button
            type="button"
            onClick={() =>
              onRemove({
                soundId: id,
                title: adminText(row.title) || "this sound",
              })
            }
            variant="ghost"
            size="xs"
            className="rounded-lg text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/50"
            title="Delete permanently"
          >
            <Trash2 className="size-3" />
          </Button>
        </div>
      </TableCell>

      {slug && (
        <audio
          ref={audioRef}
          src={`/api/sounds/${encodeURIComponent(slug)}/audio`}
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
