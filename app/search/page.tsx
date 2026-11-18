import type { Metadata } from "next"

import { SearchPageClient } from "@/components/search-page-client"
import { listPublicSounds } from "@/lib/services/sounds"

export const metadata: Metadata = {
  title: "Explore sounds",
  description: "Search the dhonn. sound library by name, category, or tag.",
  robots: { index: false, follow: true },
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; sort?: string }>
}) {
  const { q = "", category = "", sort } = await searchParams
  const allowedSorts = ["trending", "popular", "newest", "favorites"] as const
  const initialSort = allowedSorts.find((value) => value === sort) ?? "trending"
  const cleanQ = q.slice(0, 100)
  const cleanCategory = category.slice(0, 40)

  const result = await listPublicSounds({
    q: cleanQ || undefined,
    category: cleanCategory || undefined,
    sort: initialSort,
    page: 1,
    limit: 18,
  })

  return (
    <SearchPageClient
      initialQuery={cleanQ}
      initialCategory={cleanCategory}
      initialSort={initialSort}
      initialSounds={result.sounds}
      initialHasMore={result.hasMore}
    />
  )
}
