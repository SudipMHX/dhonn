"use client"

import { useState } from "react"
import Link from "next/link"
import { Disc3, Search } from "lucide-react"

import { PublicSoundResults } from "@/components/public-sound-results"
import type { SoundCardData } from "@/components/sound-tile"
import { usePublicSounds } from "@/hooks/use-public-sounds"

type Sort = "trending" | "popular" | "newest" | "favorites"

export function CategoryPageClient({
  categoryId,
  name,
  description,
  initialSounds,
  initialHasMore,
}: {
  categoryId: string
  name: string
  description: string
  initialSounds?: SoundCardData[]
  initialHasMore?: boolean
}) {
  const [query, setQuery] = useState("")
  const [sort, setSort] = useState<Sort>("trending")
  const results = usePublicSounds({
    query,
    category: categoryId,
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
        <Link
          href="/category"
          className="transition-colors hover:text-foreground"
        >
          Categories
        </Link>
        <span className="text-border">/</span>
        <span className="font-semibold text-foreground">{name}</span>
      </nav>

      {/* Category Header */}
      <header className="mb-10">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200/60 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300">
          <Disc3 className="size-3.5" />
          <span>Category Soundboard</span>
        </div>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          {name}
        </h1>
        <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </header>

      {/* Filter and Search Bar */}
      <section aria-label={`${name} sound library`}>
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              maxLength={100}
              value={query}
              onChange={(event) => {
                results.reset()
                setQuery(event.target.value)
              }}
              placeholder={`Search in ${name.toLowerCase()}...`}
              className="h-10 w-full rounded-xl border border-input bg-card pr-4 pl-10 text-sm text-foreground transition-all placeholder:text-muted-foreground/70 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Sort by</span>
            <select
              value={sort}
              onChange={(event) => {
                results.reset()
                setSort(event.target.value as Sort)
              }}
              className="h-9 rounded-lg border border-border/80 bg-card px-3 text-xs font-medium text-foreground transition-colors outline-none hover:bg-secondary focus:border-indigo-500"
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
