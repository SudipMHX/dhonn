"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { Edit3, Pause, Play, Trash2 } from "lucide-react"

import { useCreatorStore } from "@/components/creator/creator-store"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { TableCell, TableRow } from "@/components/ui/table"
import type { CreatorCategory, CreatorUpload } from "./creator-upload-data"
import { CreatorUploadEditForm } from "./creator-upload-edit-form"

export function CreatorUploadRow({
  upload,
  categories,
  categoryError,
  onSave,
  onRemove,
}: {
  upload: CreatorUpload
  categories: CreatorCategory[]
  categoryError: string
  onSave: (body: Record<string, unknown>) => Promise<boolean>
  onRemove: () => Promise<boolean>
}) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)

  const editOpen = useCreatorStore(
    (state) => state.editingUploadId === upload._id
  )
  const removeOpen = useCreatorStore(
    (state) => state.confirmRemoveUploadId === upload._id
  )
  const removing = useCreatorStore(
    (state) => state.removingUploadId === upload._id
  )
  const setEditingUploadId = useCreatorStore(
    (state) => state.setEditingUploadId
  )
  const setConfirmRemoveUploadId = useCreatorStore(
    (state) => state.setConfirmRemoveUploadId
  )
  const setRemovingUploadId = useCreatorStore(
    (state) => state.setRemovingUploadId
  )
  const initializeUploadDraft = useCreatorStore(
    (state) => state.initializeUploadDraft
  )

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

  async function remove() {
    setRemovingUploadId(upload._id)
    const removed = await onRemove()
    setRemovingUploadId(null)
    if (removed) setConfirmRemoveUploadId(null)
  }

  const canEdit = upload.status !== "uploading" && upload.status !== "removed"

  const statusVariant =
    upload.status === "published"
      ? "success"
      : upload.status === "rejected"
        ? "destructive"
        : "warning"

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
            {upload.slug ? (
              <Link
                href={`/sound/${upload.slug}`}
                className="line-clamp-1 font-semibold text-foreground transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                {upload.title}
              </Link>
            ) : (
              <p className="line-clamp-1 font-semibold text-foreground">{upload.title}</p>
            )}
          </div>
        </div>
      </TableCell>

      {/* Category */}
      <TableCell>
        <span className="rounded-md bg-secondary/80 px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {upload.categoryName || "General"}
        </span>
      </TableCell>

      {/* Status */}
      <TableCell>
        <Badge variant={statusVariant} className="gap-1.5 text-[11px] capitalize">
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
              : upload.status === "pending"
                ? "Pending Review"
                : upload.status}
        </Badge>
      </TableCell>

      {/* Moderation Note */}
      <TableCell className="max-w-xs whitespace-normal text-xs text-muted-foreground">
        {upload.moderationNote ? (
          <p className="line-clamp-2 leading-relaxed">{upload.moderationNote}</p>
        ) : (
          "—"
        )}
      </TableCell>

      {/* Actions */}
      <TableCell className="min-w-36 text-right">
        <div className="flex justify-end items-center gap-1.5">
          {canEdit && (
            <Dialog
              open={editOpen}
              onOpenChange={(open) => {
                if (open) {
                  initializeUploadDraft(upload._id, {
                    title: upload.title,
                    description: upload.description,
                    category: upload.category?.slug ?? "",
                    tags: Array.isArray(upload.tags)
                      ? upload.tags.join(", ")
                      : "",
                  })
                }
                setEditingUploadId(open ? upload._id : null)
              }}
            >
              <DialogTrigger
                render={
                  <Button type="button" variant="outline" size="xs" className="rounded-lg gap-1">
                    <Edit3 className="size-3" />
                    <span>Edit</span>
                  </Button>
                }
              />
              <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
                <DialogHeader>
                  <DialogTitle>Edit upload details</DialogTitle>
                  <DialogDescription>
                    Update the details for this sound.
                    {upload.status === "published" ||
                    upload.status === "rejected"
                      ? " Saving changes sends it back for moderator review."
                      : ""}
                  </DialogDescription>
                </DialogHeader>
                <CreatorUploadEditForm
                  upload={upload}
                  categories={categories}
                  categoryError={categoryError}
                  onSave={async (body) => {
                    const saved = await onSave(body)
                    if (saved) setEditingUploadId(null)
                    return saved
                  }}
                />
              </DialogContent>
            </Dialog>
          )}

          {upload.status !== "removed" && (
            <AlertDialog
              open={removeOpen}
              onOpenChange={(open) =>
                setConfirmRemoveUploadId(open ? upload._id : null)
              }
            >
              <Button
                type="button"
                variant="ghost"
                size="xs"
                className="rounded-lg text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/40"
                onClick={() => setConfirmRemoveUploadId(upload._id)}
                title="Remove upload"
              >
                <Trash2 className="size-3.5" />
              </Button>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remove this upload?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This permanently deletes “{upload.title}”, its audio file,
                    and associated data. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={removing}>
                    Cancel
                  </AlertDialogCancel>
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={removing}
                    onClick={() => void remove()}
                  >
                    {removing ? "Removing…" : "Remove upload"}
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
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
