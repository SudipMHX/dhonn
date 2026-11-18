"use client"

import { useEffect, type FormEvent } from "react"
import { UploadCloud } from "lucide-react"

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
        <CardHeader className="border-b border-border/60 pb-5">
          <CardTitle>Sound Details</CardTitle>
          <CardDescription>
            Provide metadata and audio file details for community discovery.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="upload-title">Sound Title</FieldLabel>
              <Input
                id="upload-title"
                name="title"
                placeholder="e.g. Dramatic Dun Dun Dun"
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
                placeholder="Give context or tips on how to use this sound..."
                maxLength={1000}
                rows={3}
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
                  className="h-10 w-full"
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
                    (comma separated)
                  </span>
                </FieldLabel>
                <Input
                  id="upload-tags"
                  name="tags"
                  placeholder="anime, meme, laugh, stream"
                  className="h-10"
                />
              </Field>
            </div>

            {/* Audio File Input with Styled Box */}
            <Field>
              <FieldLabel htmlFor="upload-audio">
                Audio File (MP3 or WAV)
              </FieldLabel>
              <div className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/80 bg-secondary/30 p-6 text-center transition-colors hover:border-indigo-500/50 hover:bg-secondary/50">
                <UploadCloud className="mb-2 size-8 text-indigo-600 dark:text-indigo-400" />
                <p className="text-xs font-semibold text-foreground">
                  Choose an audio file to upload
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  MP3 or WAV up to 15 MB · Max 30 seconds
                </p>
                <input
                  id="upload-audio"
                  name="audio"
                  type="file"
                  accept=".mp3,.wav,audio/mpeg,audio/wav"
                  required
                  className="mt-3 text-xs text-muted-foreground file:mr-3 file:rounded-xl file:border file:border-border file:bg-card file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-foreground file:shadow-2xs hover:file:bg-secondary"
                />
              </div>
            </Field>

            {/* Rights agreement check */}
            <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-secondary/40 p-3.5">
              <Checkbox
                id="rights-check"
                checked={rightsConfirmed}
                onCheckedChange={(checked) =>
                  useCreatorStore
                    .getState()
                    .setRightsConfirmed(checked === true)
                }
                aria-required="true"
                className="mt-0.5"
              />
              <label
                htmlFor="rights-check"
                className="cursor-pointer text-xs leading-relaxed text-muted-foreground select-none"
              >
                I confirm that I created this recording or possess all required
                licenses and permissions to share it publicly under the{" "}
                <a
                  href="/terms"
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-indigo-600 underline underline-offset-3 hover:text-indigo-500 dark:text-indigo-400"
                >
                  Terms of Service
                </a>
                .
              </label>
            </div>
          </FieldGroup>
        </CardContent>

        <CardFooter className="flex flex-col items-stretch gap-3 border-t border-border/60 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="inline-block size-2 animate-pulse rounded-full bg-emerald-500" />
            Verified audio is published live immediately.
          </p>
          <Button
            type="submit"
            disabled={busy || !categories.length}
            variant="primary"
            size="md"
            className="w-full font-medium sm:w-auto"
          >
            {busy ? "Uploading and verifying…" : "Publish Sound"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
