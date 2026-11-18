import type { Metadata } from "next"

import { FeaturedPageClient } from "@/components/featured-page-client"
import { listPublicSounds } from "@/lib/services/sounds"

export const metadata: Metadata = {
  title: "Featured sounds",
  description: "Explore hand-picked creator-made sounds on dhonn.",
  alternates: { canonical: "/featured" },
}

export default async function FeaturedPage() {
  const result = await listPublicSounds({
    featured: true,
    sort: "popular",
    page: 1,
    limit: 18,
  })

  return (
    <FeaturedPageClient
      initialSounds={result.sounds}
      initialHasMore={result.hasMore}
    />
  )
}
