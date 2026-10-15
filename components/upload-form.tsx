"use client"

import { useEffect, type FormEvent } from "react"

import { useCreatorStore } from "@/components/creator/creator-store"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Textarea } from "@/components/ui/textarea"

export function UploadForm() {
  const categories = useCreatorStore((state) => state.categories)
  const categoryError = useCreatorStore((state) => state.categoryError)
  const busy = useCreatorStore((state) => state.uploadBusy)
  const rightsConfirmed = useCreatorStore((state) => state.rightsConfirmed)

  useEffect(() => {
    void useCreatorStore.getState().loadCategories()
  }, [])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const values = new FormData(form)
    const file = values.get("audio")
    if (!(file instanceof File) || !file.size) {
      useCreatorStore.getState().notifyError("Choose an MP3 or WAV file.")
      return
    }
    if (file.size > 15 * 1024 * 1024) {
      useCreatorStore
        .getState()
        .notifyError("Audio files must be 15 MB or smaller.")
      return
    }
    const contentType =
      file.type === "audio/mpeg" || file.name.toLowerCase().endsWith(".mp3")
        ? "audio/mpeg"
        : file.type === "audio/wav" ||
            file.type === "audio/x-wav" ||
            file.name.toLowerCase().endsWith(".wav")
          ? "audio/wav"
          : ""
    if (!contentType) {
      useCreatorStore
        .getState()
        .notifyError("Only MP3 and WAV files are supported.")
      return
    }
    if (!rightsConfirmed) {
      useCreatorStore
        .getState()
        .notifyError("Confirm that you have the rights to share this sound.")
      return
    }

    const uploaded = await useCreatorStore.getState().upload(
      {
        title: values.get("title"),
        description: values.get("description"),
        category: values.get("category"),
        tags: String(values.get("tags") ?? "")
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        rightsConfirmed,
        fileName: file.name,
        contentType,
        size: file.size,
      },
      file
    )
    if (uploaded) form.reset()
  }

  return (
    <form onSubmit={submit} className="min-w-0">
      <Card>
        <CardHeader className="border-b">
          <CardTitle>Sound details</CardTitle>
          <CardDescription>
            Clear details help listeners discover and enjoy your sound.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="upload-title">Sound title</FieldLabel>
              <Input
                id="upload-title"
                name="title"
                placeholder="Give your sound a name"
                required
                minLength={2}
                maxLength={100}
                className="h-10"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="upload-description">
                Description{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </FieldLabel>
              <Textarea
                id="upload-description"
                name="description"
                placeholder="What should listeners know about this sound?"
                maxLength={1000}
                rows={4}
              />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="upload-category">Category</FieldLabel>
                <NativeSelect
                  id="upload-category"
                  name="category"
                  required
                  defaultValue=""
                  disabled={!categories.length}
                  className="h-10"
                >
                  <NativeSelectOption value="" disabled>
                    Select a category
                  </NativeSelectOption>
                  {categories.map((category) => (
                    <NativeSelectOption
                      key={category.slug}
                      value={category.slug}
                    >
                      {category.name}
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
                <FieldLabel htmlFor="upload-tags">
                  Tags{" "}
                  <span className="font-normal text-muted-foreground">
                    (optional)
                  </span>
                </FieldLabel>
                <Input
                  id="upload-tags"
                  name="tags"
                  placeholder="cheerful, alert, retro"
                  className="h-10"
                />
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="upload-audio">Audio file</FieldLabel>
              <Input
                id="upload-audio"
                name="audio"
                type="file"
                accept=".mp3,.wav,audio/mpeg,audio/wav"
                required
                className="h-auto min-h-12 cursor-pointer border-dashed bg-muted/30 p-2 file:mr-3 file:rounded-md file:bg-secondary file:px-3 file:py-1.5"
              />
              <FieldDescription>
                MP3 or WAV · up to 15 MB · 30 seconds maximum
              </FieldDescription>
            </Field>
            <FieldLabel className="items-start rounded-lg border bg-muted/30 p-3">
              <Checkbox
                checked={rightsConfirmed}
                onCheckedChange={(checked) =>
                  useCreatorStore
                    .getState()
                    .setRightsConfirmed(checked === true)
                }
                aria-required="true"
              />
              <span className="leading-relaxed font-normal">
                I created this sound or have permission to upload and share it,
                and I agree to the{" "}
                <a
                  href="/terms"
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-primary underline underline-offset-4"
                >
                  Terms of use
                </a>
                .
              </span>
            </FieldLabel>
          </FieldGroup>
        </CardContent>
        <CardFooter className="flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            Your sound stays private until it’s approved.
          </p>
          <Button
            type="submit"
            disabled={busy || !categories.length}
            size="md"
            className="w-full sm:w-auto"
          >
            {busy ? "Uploading and verifying…" : "Submit for review"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
