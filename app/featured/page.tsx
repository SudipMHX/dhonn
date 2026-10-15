import type { Metadata } from "next"

import { FeaturedPageClient } from "@/components/featured-page-client"

export const metadata: Metadata = {
  title: "Featured sounds",
  description: "Explore hand-picked creator-made sounds on dhonn.",
  alternates: { canonical: "/featured" },
}

export default function FeaturedPage() {
  return <FeaturedPageClient />
}
