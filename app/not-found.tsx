"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-100 px-4 py-40 dark:bg-slate-950">
      <div className="text-center">
        <p className="text-xs font-semibold tracking-widest text-sky-600 uppercase">
          404 · Not found
        </p>

        <h1 className="mt-3 text-3xl font-black">That sound isn’t here.</h1>

        <p className="mt-2 text-slate-500">
          It may be private, removed, or the link may be incorrect.
        </p>

        <div className="mt-5 flex items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-block rounded-full bg-slate-950 px-5 py-2 text-sm font-semibold text-white dark:bg-white dark:text-slate-950"
          >
            Go Home
          </Link>

          <Button
            type="button"
            onClick={() => window.history.back()}
            variant="secondary"
            size="sm"
            className="rounded-full"
            aria-label="Go back"
          >
            <ArrowLeftIcon className="size-4" />
          </Button>
        </div>
      </div>
    </main>
  )
}
