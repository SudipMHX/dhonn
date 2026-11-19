import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Disc3, Music, Grid2X2 } from "lucide-react"

import { getPublicCategories } from "@/lib/services/sounds"

export const metadata: Metadata = {
  title: "Sound categories",
  description: "Browse creator-made sounds by category on dhonn.",
  alternates: { canonical: "/category" },
}

export const dynamic = "force-dynamic"

export default async function CategoriesPage() {
  const categories = await getPublicCategories()

  return (
    <main className="mx-auto min-h-[75vh] max-w-7xl px-3 py-6 sm:px-6 sm:py-12 lg:px-8">
      {/* Header */}
      <header className="mb-8 max-w-2xl sm:mb-10">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200/60 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300">
          <Grid2X2 className="size-3.5" />
          <span>Sound Collections</span>
        </div>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-foreground sm:mt-4 sm:text-4xl">
          Categories
        </h1>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:mt-3 sm:text-base">
          Browse sounds organized by context, style, and reaction mood.
        </p>
      </header>

      {categories.length ? (
        <ul className="grid gap-3.5 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {categories.map((category) => (
            <li key={category.slug}>
              <Link
                href={`/category/${encodeURIComponent(category.slug)}`}
                className="group flex touch-manipulation flex-col justify-between rounded-2xl border border-border/80 bg-card p-5 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-indigo-500/40 hover:shadow-md active:scale-[0.99] sm:p-6"
              >
                <div>
                  <div className="flex size-10 items-center justify-center rounded-xl bg-secondary text-muted-foreground transition-colors group-hover:bg-indigo-50 group-hover:text-indigo-600 dark:group-hover:bg-indigo-950/50 dark:group-hover:text-indigo-400">
                    <Disc3 className="size-5" />
                  </div>
                  <h2 className="mt-4 text-base font-bold tracking-tight text-foreground transition-colors group-hover:text-indigo-600 sm:text-lg dark:group-hover:text-indigo-400">
                    {category.name}
                  </h2>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground sm:mt-2">
                    {category.description ||
                      `Explore community-made ${category.name.toLowerCase()} sounds and audio reactions.`}
                  </p>
                </div>

                <div className="mt-5 flex items-center gap-1 text-xs font-semibold text-indigo-600 sm:mt-6 dark:text-indigo-400">
                  <span>Browse Category</span>
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-card/40 p-12 text-center">
          <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
            <Music className="size-6" />
          </div>
          <p className="font-semibold text-foreground">
            No categories available yet
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Categories will appear once created by an administrator.
          </p>
        </div>
      )}
    </main>
  )
}
