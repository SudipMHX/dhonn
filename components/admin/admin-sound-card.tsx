"use client"

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
import { Sparkles, TrendingUp } from "lucide-react"

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
  const owner = adminChildRecord(row.owner)
  const audio = adminChildRecord(row.audio)
  const editOpen = useAdminStore((state) => state.editingSoundId === id)
  const setEditingSoundId = useAdminStore((state) => state.setEditingSoundId)
  const initializeSoundDraft = useAdminStore(
    (state) => state.initializeSoundDraft
  )
  const status = adminText(row.status)
  const statusVariant =
    status === "published"
      ? "success"
      : status === "rejected" || status === "removed"
        ? "destructive"
        : "warning"

  return (
    <TableRow>
      <TableCell className="min-w-48 font-medium whitespace-normal">
        <p className="font-semibold text-foreground">{adminText(row.title)}</p>
        <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
          {Boolean(row.featured) && (
            <span className="inline-flex items-center gap-0.5 font-medium text-amber-600 dark:text-amber-400">
              <Sparkles className="size-3" /> Featured
            </span>
          )}
          {Boolean(row.trending) && (
            <span className="inline-flex items-center gap-0.5 font-medium text-indigo-600 dark:text-indigo-400">
              <TrendingUp className="size-3" /> Trending
            </span>
          )}
        </div>
      </TableCell>
      <TableCell className="whitespace-normal">
        <p className="font-medium text-foreground">{adminText(row.categoryName)}</p>
        <p className="text-xs text-muted-foreground">{adminText(owner.name)}</p>
      </TableCell>
      <TableCell>
        <Badge variant={statusVariant}>
          {status === "published"
            ? "Published"
            : status === "rejected"
              ? "Rejected"
              : status === "pending"
                ? "Pending"
                : status || "Unknown"}
        </Badge>
      </TableCell>
      <TableCell className="whitespace-nowrap text-xs text-muted-foreground font-mono">
        <span>{Number(audio.durationSeconds).toFixed(1)}s</span>
        <br />
        <span className="font-sans text-[11px]">
          {Number(row.plays).toLocaleString()} plays ·{" "}
          {Number(row.favorites).toLocaleString()} favs
        </span>
      </TableCell>
      <TableCell className="min-w-72 whitespace-normal">
        <div className="flex flex-wrap items-center gap-1.5">
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
              >
                Publish
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
              >
                Reject
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
          >
            {row.featured ? "Unfeature" : "Feature"}
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
          >
            {row.trending ? "Untrend" : "Trend"}
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
                <Button type="button" variant="outline" size="xs">
                  Edit
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
            variant="destructive"
            size="xs"
          >
            Remove
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}
