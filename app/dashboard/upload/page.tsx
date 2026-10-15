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
      <div className="flex flex-col gap-4 border-b pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge variant="secondary" className="mb-3 gap-1.5">
            <AudioLines />
            Creator studio
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Share a sound
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Give your sound a title, add a little context, and send it to the
            community.
          </p>
        </div>
        <Badge variant="outline" className="w-fit gap-1.5 py-1">
          <ShieldCheck />
          Reviewed before publishing
        </Badge>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(17rem,0.8fr)]">
        <UploadForm />

        <aside className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileAudio className="size-4 text-primary" />
                Your upload, step by step
              </CardTitle>
              <CardDescription>
                We’ll keep you in the loop while your sound is reviewed.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-5">
                <li className="flex gap-3">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                    1
                  </span>
                  <div>
                    <p className="text-sm font-medium">Upload your sound</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Add the audio and details so people can find it.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full border bg-muted text-xs font-semibold">
                    2
                  </span>
                  <div>
                    <p className="text-sm font-medium">Moderator review</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Every new sound is checked before it goes public.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full border bg-muted text-xs font-semibold">
                    3
                  </span>
                  <div>
                    <p className="text-sm font-medium">Join the library</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Once approved, your sound is ready to be discovered.
                    </p>
                  </div>
                </li>
              </ol>
            </CardContent>
          </Card>

          <Alert>
            <AlertCircle />
            <AlertTitle>A quick rights check</AlertTitle>
            <AlertDescription>
              Only upload sounds you created or are authorized to share. Your
              submission stays private until it’s approved.
            </AlertDescription>
          </Alert>

          <Card size="sm">
            <CardContent className="space-y-3">
              <p className="text-sm font-medium">Upload checklist</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="size-4 text-primary" />
                MP3 or WAV audio
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="size-4 text-primary" />
                Up to 15 MB and 30 seconds
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="size-4 text-primary" />
                Permission to share the recording
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}
