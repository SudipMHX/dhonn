"use client"

import type { FormEvent } from "react"

import { useAdminStore } from "@/components/admin/admin-store"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { adminText, type AdminRecord } from "./admin-data"

export function SoundEditForm({
  row,
  soundId,
  onSave,
}: {
  row: AdminRecord
  soundId: string
  onSave: (body: Record<string, unknown>) => Promise<boolean>
}) {
  const draft = useAdminStore(
    (state) =>
      state.soundDrafts[soundId] ?? {
        title: adminText(row.title),
        description: adminText(row.description),
        tags: Array.isArray(row.tags) ? row.tags.join(", ") : "",
      }
  )
  const saving = useAdminStore(
    (state) => (state.mutationCounts[soundId] ?? 0) > 0
  )

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await onSave({
      title: draft.title,
      description: draft.description,
      tags: draft.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    })
  }

  return (
    <form className="mt-4 space-y-4" onSubmit={submit}>
      <FieldGroup className="space-y-4">
        <Field>
          <FieldLabel htmlFor={`sound-title-${soundId}`}>Title</FieldLabel>
          <Input
            id={`sound-title-${soundId}`}
            required
            minLength={2}
            value={draft.title}
            onChange={(event) =>
              useAdminStore
                .getState()
                .updateSoundDraft(soundId, "title", event.target.value)
            }
            maxLength={100}
            className="h-10 text-base sm:text-sm"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor={`sound-description-${soundId}`}>
            Description
          </FieldLabel>
          <Textarea
            id={`sound-description-${soundId}`}
            value={draft.description}
            onChange={(event) =>
              useAdminStore
                .getState()
                .updateSoundDraft(soundId, "description", event.target.value)
            }
            maxLength={1000}
            rows={3}
            className="min-h-20 text-base sm:text-sm"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor={`sound-tags-${soundId}`}>Tags</FieldLabel>
          <Input
            id={`sound-tags-${soundId}`}
            value={draft.tags}
            onChange={(event) =>
              useAdminStore
                .getState()
                .updateSoundDraft(soundId, "tags", event.target.value)
            }
            placeholder="anime, meme, laugh, fx"
            className="h-10 text-base sm:text-sm"
          />
          <FieldDescription>Separate tags with commas.</FieldDescription>
        </Field>
      </FieldGroup>
      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
        <Button
          type="submit"
          variant="primary"
          size="md"
          className="min-h-[44px] w-full sm:w-auto"
          disabled={saving}
        >
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  )
}
