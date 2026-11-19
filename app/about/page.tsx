import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowLeft,
  ArrowRight,
  AudioLines,
  ShieldCheck,
  Sparkles,
  Volume2,
} from "lucide-react"

export const metadata: Metadata = {
  title: "About dhonn.",
  description:
    "Learn more about the dhonn creator soundboard community and philosophy.",
}

export default function AboutPage() {
  return (
    <main className="mx-auto min-h-[75vh] max-w-4xl px-3 py-6 sm:px-6 sm:py-12 lg:px-8">
      {/* Back button */}
      <Link
        href="/"
        className="inline-flex touch-manipulation items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground active:scale-95"
      >
        <ArrowLeft className="size-3.5" />
        <span>Back to soundboard</span>
      </Link>

      {/* Hero */}
      <div className="mt-6 space-y-3 sm:mt-8 sm:space-y-4">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200/60 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300">
          <Sparkles className="size-3.5" />
          <span>Our Mission</span>
        </div>
        <h1 className="text-2xl leading-tight font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          A little sound goes a long way.
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
          dhonn is a soundboard built for fast, expressive audio bites. Discover
          short sounds, save your favorites, and share high-quality audio clips
          you created or hold permission to publish.
        </p>
      </div>

      {/* Core Pillars Grid */}
      <div className="mt-8 grid gap-4 sm:mt-12 sm:grid-cols-3 sm:gap-6">
        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs sm:p-6">
          <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
            <Volume2 className="size-5" />
          </div>
          <h3 className="font-bold text-foreground">Curated Clarity</h3>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Every audio file is limited to 30 seconds and optimized for
            instantaneous playback with zero clutter.
          </p>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs sm:p-6">
          <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
            <ShieldCheck className="size-5" />
          </div>
          <h3 className="font-bold text-foreground">Verified Creator Rights</h3>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Submissions are human-moderated before publication to maintain
            community standards and respect author copyright.
          </p>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs sm:p-6">
          <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300">
            <AudioLines className="size-5" />
          </div>
          <h3 className="font-bold text-foreground">
            Offline &amp; Embed Ready
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Service-worker caching empowers instant replay on mobile, while
            lightweight embeds work seamlessly in websites.
          </p>
        </div>
      </div>

      {/* Creator banner */}
      <div className="mt-8 flex flex-col items-center justify-between gap-5 rounded-2xl border border-border/80 bg-card p-6 sm:mt-12 sm:flex-row sm:gap-6 sm:p-8">
        <div>
          <h2 className="text-lg font-bold text-foreground sm:text-xl">
            Have a sound worth sharing?
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Join the creator community and submit your audio bites to the
            catalog.
          </p>
        </div>
        <Link
          href="/dashboard/upload"
          className="inline-flex h-11 w-full shrink-0 touch-manipulation items-center justify-center rounded-xl bg-indigo-600 px-5 text-xs font-semibold text-white shadow-xs shadow-indigo-600/30 transition-all hover:bg-indigo-500 active:scale-95 sm:w-auto"
        >
          <span>Share a sound</span>
          <ArrowRight className="ml-1.5 size-4" />
        </Link>
      </div>
    </main>
  )
}
