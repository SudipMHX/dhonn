"use client"

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

  async function remove() {
    setRemovingUploadId(upload._id)
    const removed = await onRemove()
    setRemovingUploadId(null)
    if (removed) setConfirmRemoveUploadId(null)
  }

  const canEdit = upload.status !== "uploading" && upload.status !== "removed"

  return (
    <TableRow>
      <TableCell className="min-w-44 font-medium whitespace-normal">
        {upload.title}
      </TableCell>
      <TableCell>{upload.categoryName}</TableCell>
      <TableCell>
        <Badge
          variant={
            upload.status === "published"
              ? "default"
              : upload.status === "rejected"
                ? "destructive"
                : "secondary"
          }
        >
          {upload.status}
        </Badge>
      </TableCell>
      <TableCell className="min-w-48 whitespace-normal text-muted-foreground">
        {upload.moderationNote || "—"}
      </TableCell>
      <TableCell className="min-w-40 text-right">
        <div className="flex justify-end gap-2">
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
                  <Button type="button" variant="outline" size="sm">
                    Edit
                  </Button>
                }
              />
              <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
                <DialogHeader>
                  <DialogTitle>Edit upload</DialogTitle>
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
                variant="destructive"
                size="sm"
                onClick={() => setConfirmRemoveUploadId(upload._id)}
              >
                Remove
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
    </TableRow>
  )
}
