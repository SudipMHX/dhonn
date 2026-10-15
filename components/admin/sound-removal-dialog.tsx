"use client"

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import type { AdminMutation } from "./admin-data"
import { useAdminStore } from "./admin-store"

export type SoundRemovalTarget = {
  soundId: string
  title: string
}

export function SoundRemovalDialog({
  target,
  onClose,
  mutate,
}: {
  target: SoundRemovalTarget | null
  onClose: () => void
  mutate: AdminMutation
}) {
  const removing = useAdminStore((state) => state.removingSound)
  const setRemoving = useAdminStore((state) => state.setRemovingSound)

  async function removeSound() {
    if (!target) return
    setRemoving(true)
    try {
      const removed = await mutate("sound.delete", target.soundId)
      if (removed) onClose()
    } finally {
      setRemoving(false)
    }
  }

  return (
    <AlertDialog
      open={target !== null}
      onOpenChange={(open) => {
        if (!open && !removing) onClose()
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove sound?</AlertDialogTitle>
          <AlertDialogDescription>
            {target
              ? `This permanently deletes “${target.title}”, its audio file, and associated data. This action cannot be undone.`
              : ""}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={removing}>Cancel</AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            onClick={() => void removeSound()}
            disabled={removing}
          >
            {removing ? "Removing…" : "Remove sound"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
