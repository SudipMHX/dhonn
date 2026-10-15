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
      ? "default"
      : status === "rejected" || status === "removed"
        ? "destructive"
        : "secondary"

  return (
    <TableRow>
      <TableCell className="min-w-48 font-medium whitespace-normal">
        {adminText(row.title)}
      </TableCell>
      <TableCell className="whitespace-normal">
        <p>{adminText(row.categoryName)}</p>
        <p className="text-xs text-muted-foreground">{adminText(owner.name)}</p>
      </TableCell>
      <TableCell>
        <Badge variant={statusVariant}>{status || "Unknown"}</Badge>
      </TableCell>
      <TableCell className="whitespace-nowrap text-muted-foreground">
        {Number(audio.durationSeconds).toFixed(1)} sec
        <br />
        {Number(row.plays).toLocaleString()} plays ·{" "}
        {Number(row.favorites).toLocaleString()} favorites
      </TableCell>
      <TableCell className="min-w-72 whitespace-normal">
        <div className="flex flex-wrap gap-2">
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
                variant="default"
                size="sm"
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
              size="sm"
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
                size="sm"
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
            size="sm"
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
            size="sm"
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
                <Button type="button" variant="outline" size="sm">
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
            size="sm"
          >
            Remove
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}
