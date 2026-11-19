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
    <form className="mt-4 space-y-4" onSubmit={submit}>
      <FieldGroup className="space-y-4">
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
            className="h-10 text-base sm:text-sm"
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
            rows={3}
            className="min-h-20 text-base sm:text-sm"
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
            className="h-10 text-base sm:text-sm"
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
            placeholder="anime, meme, laugh"
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
          disabled={saving || !categories.length}
        >
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  )
}
