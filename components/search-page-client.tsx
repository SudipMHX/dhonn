"use client"

import { useState } from "react"
import Link from "next/link"
import { Compass, Search, X } from "lucide-react"

import { PublicSoundResults } from "@/components/public-sound-results"
import type { SoundCardData } from "@/components/sound-tile"
import { usePublicSounds } from "@/hooks/use-public-sounds"

type Sort = "trending" | "popular" | "newest" | "favorites"

export function SearchPageClient({
  initialQuery,
  initialCategory,
  initialSort,
  initialSounds,
  initialHasMore,
}: {
  initialQuery: string
  initialCategory: string
  initialSort: Sort
  initialSounds?: SoundCardData[]
  initialHasMore?: boolean
}) {
  const [query, setQuery] = useState(initialQuery)
  const [sort, setSort] = useState<Sort>(initialSort)
  const results = usePublicSounds({
    query,
    category: initialCategory,
    sort,
    initialSounds,
    initialHasMore,
  })

  return (
    <main className="mx-auto min-h-[75vh] max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex items-center gap-2 text-xs font-medium text-muted-foreground"
      >
        <Link href="/" className="transition-colors hover:text-foreground">
          Home
        </Link>
        <span className="text-border">/</span>
        <span className="font-semibold text-foreground">Explore</span>
      </nav>

      {/* Header */}
      <header className="mb-10 max-w-2xl">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200/60 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300">
          <Compass className="size-3.5" />
          <span>Library Discovery</span>
        </div>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Explore Sounds
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          Find creator-made sounds by keyword, topic, reaction, or descriptive
          tag.
        </p>
      </header>

      {/* Search Toolbar */}
      <section aria-label="Search results">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xl">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              maxLength={100}
              value={query}
              onChange={(event) => {
                results.reset()
                setQuery(event.target.value)
              }}
              placeholder="Search by sound name, mood, or tag..."
              className="h-11 w-full rounded-xl border border-input bg-card pr-10 pl-10 text-sm text-foreground transition-all placeholder:text-muted-foreground/70 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  results.reset()
                  setQuery("")
                }}
                className="absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
                <span className="sr-only">Clear search</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Sort by</span>
            <select
              value={sort}
              onChange={(event) => {
                results.reset()
                setSort(event.target.value as Sort)
              }}
              className="h-10 rounded-xl border border-border/80 bg-card px-3 text-xs font-medium text-foreground transition-colors outline-none hover:bg-secondary focus:border-indigo-500"
            >
              <option value="trending">Trending</option>
              <option value="popular">Most played</option>
              <option value="favorites">Most favorited</option>
              <option value="newest">Recently added</option>
            </select>
          </div>
        </div>

        <PublicSoundResults
          sounds={results.sounds}
          hasMore={results.hasMore}
          loading={results.loading}
          error={results.error}
          onLoadMore={results.loadMore}
          onRetry={results.retry}
        />
      </section>
    </main>
  )
}
