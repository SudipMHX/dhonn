"use client"

import { PublicSoundResults } from "@/components/public-sound-results"
import { usePublicSounds } from "@/hooks/use-public-sounds"

export function FeaturedPageClient() {
  const results = usePublicSounds({ featured: true, sort: "popular" })

  return (
    <main className="mx-auto min-h-[70vh] max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="text-xs font-semibold tracking-[0.2em] text-violet-600 uppercase dark:text-violet-400">
          Picked by the team
        </p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">
          {" "}
          Featured sounds
        </h1>
        <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-300">
          A hand-picked collection of creator-made sounds worth hearing.
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
