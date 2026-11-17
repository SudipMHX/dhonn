import { UploadForm } from "@/components/upload-form"
import {
  AlertCircle,
  AudioLines,
  Check,
  FileAudio,
  ShieldCheck,
} from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const metadata = {
  title: "Upload a sound",
  robots: { index: false, follow: false },
}

export default function UploadPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-border/80 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge variant="indigo" className="mb-2.5 gap-1.5">
            <AudioLines className="size-3" />
            <span>Sound Submissions</span>
          </Badge>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Upload Sound
          </h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Publish your audio recording or sound bite to the dhonn community library.
          </p>
        </div>
        <Badge variant="outline" className="w-fit gap-1.5 py-1 text-xs">
          <ShieldCheck className="size-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>Moderated for quality</span>
        </Badge>
      </div>

      <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1.6fr)_minmax(18rem,0.9fr)]">
        <UploadForm />

        <aside className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileAudio className="size-4 text-indigo-600 dark:text-indigo-400" />
                <span>Upload &amp; Review Process</span>
              </CardTitle>
              <CardDescription>
                How your submission makes its way to the public soundboard.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4">
                <li className="flex gap-3">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-indigo-600 text-xs font-bold text-white shadow-2xs">
                    1
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-foreground">Upload Audio File</p>
                    <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                      Select an MP3 or WAV recording and add descriptive title and tags.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full border border-border bg-secondary text-xs font-bold text-muted-foreground">
                    2
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-foreground">Moderation Review</p>
                    <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                      Audio is verified for duration, volume consistency, and copyright.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full border border-border bg-secondary text-xs font-bold text-muted-foreground">
                    3
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-foreground">Public Release</p>
                    <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                      Approved sounds appear in search, category filters, and featured shelves.
                    </p>
                  </div>
                </li>
              </ol>
            </CardContent>
          </Card>

          <Alert variant="info">
            <AlertCircle className="size-4" />
            <AlertTitle>Copyright Notice</AlertTitle>
            <AlertDescription>
              Only submit audio you personally created or hold explicit authorization to share. Submissions remain private until verified.
            </AlertDescription>
          </Alert>

          <Card size="sm">
            <CardContent className="space-y-2.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Specifications Checklist
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Format: MP3 or WAV (stereo/mono)</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Size: Up to 15 MB · Duration up to 30s</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Clear sound, no excessive clipping</span>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}
