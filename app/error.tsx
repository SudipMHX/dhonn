"use client"

import { useEffect } from "react"
import Link from "next/link"
import { AlertCircle, Home, RotateCcw } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function ErrorPage({
  error,
  reset,
  retry,
}: {
  error: Error & { digest?: string }
  reset?: () => void
  retry?: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  const handleRetry = reset ?? retry ?? (() => window.location.reload())

  return (
    <main className="grid min-h-[80vh] place-items-center px-4 py-20 text-center">
      <div className="w-full max-w-md rounded-2xl border border-border/80 bg-card p-8 shadow-xs">
        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 mb-4">
          <AlertCircle className="size-6" />
        </div>

        <p className="text-xs font-semibold tracking-wider text-rose-600 uppercase dark:text-rose-400">
          Unexpected Error
        </p>

        <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
          We couldn&apos;t load this page.
        </h1>

        <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
          An unexpected interruption occurred. Try reloading or return to the main soundboard library.
        </p>

        {error.digest && (
          <div className="mt-4 rounded-xl border border-border/60 bg-secondary/50 p-2.5 text-xs text-muted-foreground">
            Error ID: <code className="font-mono text-foreground font-semibold">{error.digest}</code>
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button
            type="button"
            onClick={handleRetry}
            variant="primary"
            size="md"
          >
            <RotateCcw className="size-4" />
            <span>Try Again</span>
          </Button>

          <Button
            nativeButton={false}
            variant="outline"
            size="md"
            render={<Link href="/" />}
          >
            <Home className="size-4" />
            <span>Go Home</span>
          </Button>
        </div>
      </div>
    </main>
  )
}
