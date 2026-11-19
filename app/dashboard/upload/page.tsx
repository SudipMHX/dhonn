import { UploadForm } from "@/components/upload-form"
import {
  AlertCircle,
  AudioLines,
  Check,
  FileAudio,
  Sparkles,
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
    <div className="space-y-6 sm:space-y-8">
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
            Publish your audio recording or sound bite to the dhonn community
            library.
          </p>
        </div>
        <Badge
          variant="outline"
          className="w-fit gap-1.5 border-emerald-500/30 bg-emerald-500/10 py-1 text-xs text-emerald-600 dark:text-emerald-400"
        >
          <Sparkles className="size-3.5" />
          <span>Instant Publishing</span>
        </Badge>
      </div>

      <div className="grid items-start gap-6 sm:gap-8 xl:grid-cols-[minmax(0,1.6fr)_minmax(18rem,0.9fr)]">
        <UploadForm />

        <aside className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileAudio className="size-4 text-indigo-600 dark:text-indigo-400" />
                <span>Upload &amp; Publish Pipeline</span>
              </CardTitle>
              <CardDescription>
                How your audio recording goes live on the public soundboard.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4">
                <li className="flex gap-3">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-indigo-600 text-xs font-bold text-white shadow-2xs">
                    1
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-foreground">
                      Upload Audio File
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                      Select an MP3 or WAV recording and add descriptive title
                      and tags.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-indigo-600/10 text-xs font-bold text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-400">
                    2
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-foreground">
                      Instant Verification
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                      Audio format, duration (≤ 30s), waveform integrity, and
                      sha256 deduplication verify in seconds.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-emerald-600/15 text-xs font-bold text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-400">
                    3
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-foreground">
                      Live Instant Release
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                      Your sound is published live immediately to search,
                      category feeds, and soundboards.
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
              Only submit audio you personally created or hold explicit
              authorization to share. Sounds are verified and published live
              immediately upon upload.
            </AlertDescription>
          </Alert>

          <Card size="sm">
            <CardContent className="space-y-2.5">
              <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
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
                <span>Auto-published immediately upon verification</span>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}
