import type { Metadata } from "next"
import Link from "next/link"

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
    <main className="mx-auto min-h-[70vh] max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="text-xs font-semibold tracking-[0.2em] text-sky-600 uppercase dark:text-sky-400">
          Browse the library
        </p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">
          Sound categories
        </h1>
        <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-300">
          Explore sounds grouped by the moments and moods they fit.
        </p>
      </header>
      {categories.length ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <li key={category.slug}>
              <Link
                href={`/category/${encodeURIComponent(category.slug)}`}
                className="block rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
              >
                <h2 className="text-xl font-bold">{category.name}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {category.description ||
                    `Browse creator-made ${category.name.toLowerCase()} sounds.`}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-3xl border border-dashed border-slate-300 p-12 text-center text-slate-500 dark:border-slate-700">
          No categories are available yet.
        </p>
      )}
    </main>
  )
}
