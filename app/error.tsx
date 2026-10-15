"use client"

import { useEffect } from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"

export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="grid min-h-screen place-items-center bg-slate-100 px-4 dark:bg-slate-950">
      <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
        <p className="text-xs font-semibold tracking-widest text-rose-600 uppercase">
          Something went wrong
        </p>
        <h1 className="mt-3 text-2xl font-bold">We couldn’t load this page.</h1>
        <p className="mt-2 text-sm text-slate-500">
          An unexpected error interrupted this page. Try again, or return home
          and reopen it.
        </p>
        {error.digest && (
          <p className="mt-4 text-xs text-slate-500">
            If the problem continues, share this reference with support:{" "}
            <code className="font-mono">{error.digest}</code>
          </p>
        )}
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Button type="button" onClick={() => retry()} size="lg">
            Try again
          </Button>
          <Link
            href="/"
            className="inline-flex h-12 items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-sm font-medium text-slate-900 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
          >
            Go home
          </Link>
        </div>
      </div>
    </main>
  )
}
