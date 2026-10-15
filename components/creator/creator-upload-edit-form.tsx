"use client"

import type { FormEvent } from "react"

import { useCreatorStore } from "@/components/creator/creator-store"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Textarea } from "@/components/ui/textarea"
import type { CreatorCategory, CreatorUpload } from "./creator-upload-data"

export function CreatorUploadEditForm({
  upload,
  categories,
  categoryError,
  onSave,
}: {
  upload: CreatorUpload
  categories: CreatorCategory[]
  categoryError: string
  onSave: (body: Record<string, unknown>) => Promise<boolean>
}) {
  const draft = useCreatorStore(
    (state) =>
      state.uploadDrafts[upload._id] ?? {
        title: upload.title,
        description: upload.description,
        category: upload.category?.slug ?? "",
        tags: Array.isArray(upload.tags) ? upload.tags.join(", ") : "",
      }
  )
  const saving = useCreatorStore((state) => state.savingUploadId === upload._id)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await onSave({
      title: draft.title,
      description: draft.description,
      category: draft.category,
      tags: draft.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    })
  }

  return (
    <form className="space-y-4" onSubmit={submit}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor={`upload-title-${upload._id}`}>Title</FieldLabel>
          <Input
            id={`upload-title-${upload._id}`}
            value={draft.title}
            onChange={(event) =>
              useCreatorStore
                .getState()
                .updateUploadDraft(upload._id, "title", event.target.value)
            }
            required
            minLength={2}
            maxLength={100}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor={`upload-description-${upload._id}`}>
            Description
          </FieldLabel>
          <Textarea
            id={`upload-description-${upload._id}`}
            value={draft.description}
            onChange={(event) =>
              useCreatorStore
                .getState()
                .updateUploadDraft(
                  upload._id,
                  "description",
                  event.target.value
                )
            }
            maxLength={1000}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor={`upload-category-${upload._id}`}>
            Category
          </FieldLabel>
          <NativeSelect
            id={`upload-category-${upload._id}`}
            value={draft.category}
            onChange={(event) =>
              useCreatorStore
                .getState()
                .updateUploadDraft(upload._id, "category", event.target.value)
            }
            required
            disabled={Boolean(categoryError) || categories.length === 0}
          >
            <NativeSelectOption value="" disabled>
              Select a category
            </NativeSelectOption>
            {categories.map((item) => (
              <NativeSelectOption key={item.slug} value={item.slug}>
                {item.name}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          {categoryError && (
            <FieldDescription className="text-destructive">
              {categoryError}
            </FieldDescription>
          )}
        </Field>
        <Field>
          <FieldLabel htmlFor={`upload-tags-${upload._id}`}>Tags</FieldLabel>
          <Input
            id={`upload-tags-${upload._id}`}
            value={draft.tags}
            onChange={(event) =>
              useCreatorStore
                .getState()
                .updateUploadDraft(upload._id, "tags", event.target.value)
            }
            aria-description="Separate tags with commas"
          />
          <FieldDescription>Separate tags with commas.</FieldDescription>
        </Field>
      </FieldGroup>
      <Button type="submit" disabled={saving || !categories.length}>
        {saving ? "Saving…" : "Save changes"}
      </Button>
    </form>
  )
}
