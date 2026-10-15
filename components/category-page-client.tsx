"use client"

import { useState } from "react"

import { PublicSoundResults } from "@/components/public-sound-results"
import { usePublicSounds } from "@/hooks/use-public-sounds"

type Sort = "trending" | "popular" | "newest" | "favorites"

export function CategoryPageClient({
  categoryId,
  name,
  description,
}: {
  categoryId: string
  name: string
  description: string
}) {
  const [query, setQuery] = useState("")
  const [sort, setSort] = useState<Sort>("trending")
  const results = usePublicSounds({ query, category: categoryId, sort })

  return (
    <main className="mx-auto min-h-[70vh] max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="text-xs font-semibold tracking-[0.2em] text-violet-600 uppercase dark:text-violet-400">
          Sound category
        </p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">{name}</h1>
        <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-300">
          {description}
        </p>
      </header>

      <section aria-label={`${name} sounds`}>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex w-full items-center gap-3 rounded-full border border-slate-200 bg-white px-5 py-3 shadow-sm sm:max-w-xl dark:border-slate-700 dark:bg-slate-900">
            <span aria-hidden="true">⌕</span>
            <span className="sr-only">Search in {name}</span>
            <input
              type="search"
              maxLength={100}
              value={query}
              onChange={(event) => {
                results.reset()
                setQuery(event.target.value)
              }}
              placeholder={`Search ${name.toLowerCase()} sounds...`}
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-500">
            Sort by
            <select
              value={sort}
              onChange={(event) => {
                results.reset()
                setSort(event.target.value as Sort)
              }}
              className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              <option value="trending">Trending</option>
              <option value="popular">Most played</option>
              <option value="favorites">Most favorited</option>
              <option value="newest">Newest</option>
            </select>
          </label>
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
