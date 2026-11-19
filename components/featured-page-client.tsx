"use client"

import Link from "next/link"
import { Sparkles } from "lucide-react"

import { PublicSoundResults } from "@/components/public-sound-results"
import type { SoundCardData } from "@/components/sound-tile"
import { usePublicSounds } from "@/hooks/use-public-sounds"

export function FeaturedPageClient({
  initialSounds,
  initialHasMore,
}: {
  initialSounds?: SoundCardData[]
  initialHasMore?: boolean
} = {}) {
  const results = usePublicSounds({
    featured: true,
    sort: "popular",
    initialSounds,
    initialHasMore,
  })

  return (
    <main className="mx-auto min-h-[75vh] max-w-7xl px-3 py-6 sm:px-6 sm:py-10 lg:px-8">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="mb-5 flex scrollbar-none items-center gap-2 overflow-x-auto text-xs font-medium whitespace-nowrap text-muted-foreground sm:mb-6"
      >
        <Link href="/" className="transition-colors hover:text-foreground">
          Home
        </Link>
        <span className="text-border">/</span>
        <span className="font-semibold text-foreground">Featured</span>
      </nav>

      {/* Header */}
      <header className="mb-8 max-w-2xl sm:mb-10">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200/60 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300">
          <Sparkles className="size-3.5" />
          <span>Curated Audio</span>
        </div>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-foreground sm:mt-4 sm:text-4xl">
          Featured Sounds
        </h1>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:mt-3 sm:text-base">
          A hand-picked collection of exceptional creator-made sounds that stand
          out for quality and utility.
        </p>
      </header>

      <PublicSoundResults
        sounds={results.sounds}
        hasMore={results.hasMore}
        loading={results.loading}
        error={results.error}
        onLoadMore={results.loadMore}
        onRetry={results.retry}
      />
    </main>
  )
}
