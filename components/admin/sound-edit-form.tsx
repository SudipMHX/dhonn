"use client"

import type { FormEvent } from "react"

import { useAdminStore } from "@/components/admin/admin-store"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
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
    <form className="mt-3" onSubmit={submit}>
      <FieldGroup className="grid gap-3 sm:grid-cols-2">
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
            aria-description="Separate tags with commas"
          />
        </Field>
      </FieldGroup>
      <Button type="submit" size="sm" className="mt-3 w-fit" disabled={saving}>
        {saving ? "Saving…" : "Save changes"}
      </Button>
    </form>
  )
}
