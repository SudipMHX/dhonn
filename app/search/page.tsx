import type { Metadata } from "next"

import { SearchPageClient } from "@/components/search-page-client"

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
  return (
    <SearchPageClient
      initialQuery={q.slice(0, 100)}
      initialCategory={category.slice(0, 40)}
      initialSort={initialSort}
    />
  )
}
