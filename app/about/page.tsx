import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = { title: "About dhonn." }

export default function AboutPage() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-16">
      <Link href="/" className="text-sm font-semibold text-sky-600">
        ← dhonn.
      </Link>
      <h1 className="mt-8 text-4xl font-black">
        A little sound goes a long way.
      </h1>
      <p className="mt-5 leading-7 text-slate-600 dark:text-slate-300">
        dhonn. is a soundboard for quick, expressive audio. Discover short
        sounds, save your favorites, and share work you created or are
        authorized to publish. Every community submission is reviewed before it
        becomes public.
      </p>
    </main>
  )
}
