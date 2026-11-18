"use client"

import Link from "next/link"
import { ArrowLeft, Home, VolumeX } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <main className="relative grid min-h-[80vh] place-items-center px-4 py-20 text-center">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -z-10 size-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-[100px]"
      />

      <div className="max-w-md">
        <div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-2xl bg-secondary text-indigo-600 shadow-2xs dark:text-indigo-400">
          <VolumeX className="size-7" />
        </div>

        <p className="text-xs font-semibold tracking-wider text-indigo-600 uppercase dark:text-indigo-400">
          404 · Missing Audio
        </p>

        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          That sound isn&apos;t here.
        </h1>

        <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
          The sound bite you requested may be private, undergoing review, or may
          have been permanently removed.
        </p>

        <div className="mt-8 flex items-center justify-center gap-3">
          <Button
            nativeButton={false}
            variant="primary"
            size="md"
            render={<Link href="/" />}
          >
            <Home className="size-4" />
            <span>Back to Soundboard</span>
          </Button>

          <Button
            type="button"
            onClick={() => window.history.back()}
            variant="outline"
            size="md"
            aria-label="Go back to previous page"
          >
            <ArrowLeft className="size-4" />
            <span>Go Back</span>
          </Button>
        </div>
      </div>
    </main>
  )
}
