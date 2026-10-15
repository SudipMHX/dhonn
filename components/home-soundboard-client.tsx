"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { SoundCardData, SoundTile } from "@/components/sound-tile"

type Category = { _id: string; name: string; slug: string }
type SoundResponse = { sounds: SoundCardData[]; hasMore: boolean }
type Sort = "trending" | "popular" | "newest" | "favorites"

function SoundTileSkeleton() {
  return (
    <div className="space-y-3 rounded-[26px] border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <Skeleton className="h-36 rounded-[20px]" />
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-9 w-full rounded-full" />
    </div>
  )
}

function SoundTileSkeletonGrid({ count }: { count: number }) {
  return (
    <div aria-busy="true" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }, (_, index) => (
        <SoundTileSkeleton key={index} />
      ))}
    </div>
  )
}

export function HomeSoundboardClient({
  initialQuery = "",
  initialCategory = "",
  pageTitle,
  pageDescription,
}: {
  initialQuery?: string
  initialCategory?: string
  pageTitle?: string
  pageDescription?: string
}) {
  const [query, setQuery] = useState(initialQuery)
  const [category, setCategory] = useState(initialCategory)
  const [sort, setSort] = useState<Sort>("trending")
  const [page, setPage] = useState(1)
  const [sounds, setSounds] = useState<SoundCardData[]>([])
  const [featured, setFeatured] = useState<SoundCardData[]>([])
  const [recent, setRecent] = useState<SoundCardData[]>([])
  const [hasMore, setHasMore] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    fetch("/api/categories", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Categories are unavailable.")
        return response.json() as Promise<Category[]>
      })
      .then(setCategories)
      .catch((cause: unknown) => {
        if (cause instanceof DOMException && cause.name === "AbortError") return
        setError("Categories are temporarily unavailable.")
      })
    return () => controller.abort()
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    const timer = window.setTimeout(
      async () => {
        setLoading(true)
        setError("")
        const params = new URLSearchParams({
          q: query,
          sort,
          page: String(page),
          limit: "16",
        })
        if (category) params.set("category", category)
        try {
          const discovery = page === 1 && !query && !category
          const [response, featuredResponse, recentResponse] =
            await Promise.all([
              fetch(`/api/sounds?${params.toString()}`, {
                signal: controller.signal,
              }),
              discovery
                ? fetch("/api/sounds?featured=true&sort=popular&limit=3", {
                    signal: controller.signal,
                  })
                : Promise.resolve(null),
              discovery
                ? fetch("/api/sounds?sort=newest&limit=3", {
                    signal: controller.signal,
                  })
                : Promise.resolve(null),
            ])
          if (!response.ok)
            throw new Error("The sound library is temporarily unavailable.")
          const data = (await response.json()) as SoundResponse
          setSounds((current) =>
            page === 1 ? data.sounds : [...current, ...data.sounds]
          )
          setHasMore(data.hasMore)
          if (featuredResponse?.ok) {
            const featuredData =
              (await featuredResponse.json()) as SoundResponse
            setFeatured(featuredData.sounds)
          }
          if (recentResponse?.ok) {
            const recentData = (await recentResponse.json()) as SoundResponse
            setRecent(recentData.sounds)
          }
        } catch (cause) {
          if (cause instanceof DOMException && cause.name === "AbortError")
            return
          setError(
            cause instanceof Error
              ? cause.message
              : "The sound library is temporarily unavailable."
          )
        } finally {
          if (!controller.signal.aborted) setLoading(false)
        }
      },
      query ? 300 : 0
    )
    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [query, category, sort, page, retry])

  function changeFilter(change: () => void) {
    setSounds([])
    setPage(1)
    setLoading(true)
    change()
  }

  function loadMoreSounds() {
    setLoading(true)
    setPage((current) => current + 1)
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-900">
          <div className="grid gap-8 p-6 md:grid-cols-[1.2fr_0.8fr] md:p-9 xl:p-12">
            <div className="flex flex-col justify-center">
              <span className="w-fit rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold tracking-[0.17em] text-sky-800 uppercase dark:border-sky-900 dark:bg-sky-950 dark:text-sky-200">
                Your next favorite sound
              </span>
              <h1 className="mt-5 max-w-xl text-4xl font-black tracking-tight sm:text-6xl">
                {pageTitle ?? (
                  <>
                    Little sounds.
                    <br />
                    <span className="text-sky-500">Big reactions.</span>
                  </>
                )}
              </h1>
              <p className="mt-4 max-w-lg text-base leading-7 text-slate-600 dark:text-slate-300">
                {pageDescription ??
                  "Discover quick, creator-made sound bites for streams, chats, videos, and everything in between."}
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  href="#library"
                  className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-600 dark:bg-white dark:text-slate-950"
                >
                  Explore sounds
                </a>
                <Link
                  href="/dashboard/upload"
                  className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                >
                  Share your sound
                </Link>
              </div>
            </div>
            <div
              id="featured"
              className="relative flex min-h-64 flex-col justify-between overflow-hidden rounded-[26px] bg-slate-950 p-6 text-white"
            >
              <div className="absolute -top-14 -right-14 h-64 w-64 rounded-full bg-gradient-to-br from-sky-400 via-violet-500 to-fuchsia-500 opacity-80 blur-2xl" />
              <div className="relative flex items-center justify-between text-sm text-slate-300">
                <span>THE SOUND SHELF</span>
                <span className="rounded-full border border-white/15 px-2.5 py-1 text-[10px] tracking-widest">
                  CREATOR-MADE
                </span>
              </div>
              <div className="relative">
                <div
                  className="mb-4 flex h-20 items-end gap-1.5"
                  aria-hidden="true"
                >
                  {[
                    24, 50, 34, 68, 42, 82, 36, 60, 28, 70, 46, 88, 30, 55, 39,
                    74, 26, 61, 44, 78,
                  ].map((height, index) => (
                    <span
                      key={index}
                      className="flex-1 rounded-full bg-gradient-to-t from-sky-500 to-fuchsia-300 opacity-90"
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>
                <p className="text-2xl font-bold">Play something good.</p>
                <p className="mt-1 text-sm text-slate-300">
                  Every sound is one tap away.
                </p>
              </div>
            </div>
          </div>
        </section>

        {!query && !category && (featured.length > 0 || loading) && (
          <section className="mt-11">
            <div className="mb-4 flex items-end justify-between">
              <div>
                <p className="text-xs font-semibold tracking-[0.2em] text-violet-600 uppercase dark:text-violet-400">
                  Picked by the team
                </p>
                <h2 className="mt-1 text-2xl font-bold">Featured sounds</h2>
              </div>
              <Link
                href="/featured"
                className="text-sm font-medium text-sky-600"
              >
                Explore all
              </Link>
            </div>
            {featured.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
                {featured.map((sound, index) => (
                  <SoundTile key={sound._id} sound={sound} index={index} />
                ))}
              </div>
            ) : (
              <div
                aria-busy="true"
                className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5"
              >
                {Array.from({ length: 5 }, (_, index) => (
                  <SoundTileSkeleton key={index} />
                ))}
              </div>
            )}
          </section>
        )}

        {!query && !category && (recent.length > 0 || loading) && (
          <section className="mt-11">
            <div className="mb-4 flex items-end justify-between">
              <div>
                <p className="text-xs font-semibold tracking-[0.2em] text-emerald-700 uppercase dark:text-emerald-400">
                  Just landed
                </p>
                <h2 className="mt-1 text-2xl font-bold">Recently added</h2>
              </div>
              <Link
                href="/search?sort=newest"
                className="text-sm font-medium text-sky-600"
              >
                See what’s new
              </Link>
            </div>
            {recent.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
                {recent.map((sound, index) => (
                  <SoundTile key={sound._id} sound={sound} index={index + 1} />
                ))}
              </div>
            ) : (
              <div
                aria-busy="true"
                className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5"
              >
                {Array.from({ length: 5 }, (_, index) => (
                  <SoundTileSkeleton key={index} />
                ))}
              </div>
            )}
          </section>
        )}

        <section id="library" className="mt-12 scroll-mt-24">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] text-sky-600 uppercase dark:text-sky-400">
                Find your sound
              </p>
              <h2 className="mt-1 text-3xl font-black tracking-tight">
                Explore the library
              </h2>
            </div>
            <label className="flex w-full items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-slate-500 shadow-sm sm:max-w-sm dark:border-slate-700 dark:bg-slate-900">
              <span aria-hidden="true">⌕</span>
              <span className="sr-only">Search sounds</span>
              <input
                value={query}
                onChange={(event) =>
                  changeFilter(() => setQuery(event.target.value))
                }
                placeholder="Search sounds, tags..."
                className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
              />
            </label>
          </div>
          <div
            aria-busy={loading && categories.length === 0}
            className="mb-4 flex flex-wrap gap-2"
          >
            {categories.length === 0 && loading ? (
              Array.from({ length: 5 }, (_, index) => (
                <Skeleton key={index} className="h-9 w-20 rounded-full" />
              ))
            ) : (
              <>
                <Button
                  type="button"
                  onClick={() => changeFilter(() => setCategory(""))}
                  aria-pressed={!category}
                  variant={!category ? "primary" : "secondary"}
                  size="sm"
                  className="px-3 py-1.5 text-sm"
                >
                  Everything
                </Button>
                {categories.map((item) => (
                  <Button
                    key={item.slug}
                    type="button"
                    onClick={() => changeFilter(() => setCategory(item._id))}
                    aria-pressed={category === item._id}
                    variant={category === item._id ? "primary" : "secondary"}
                    size="sm"
                    className="px-3 py-1.5 text-sm"
                  >
                    {item.name}
                  </Button>
                ))}
              </>
            )}
          </div>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-slate-500 dark:text-slate-400">
              {loading ? (
                <Skeleton className="h-4 w-24" />
              ) : (
                `${sounds.length}${hasMore ? "+" : ""} sounds`
              )}
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-500">
              Sort by
              <select
                value={sort}
                onChange={(event) =>
                  changeFilter(() => setSort(event.target.value as Sort))
                }
                className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                <option value="trending">Trending</option>
                <option value="popular">Most played</option>
                <option value="favorites">Most favorited</option>
                <option value="newest">Newest</option>
              </select>
            </label>
          </div>
          {error ? (
            <div
              role="alert"
              className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200"
            >
              <p className="font-semibold">
                We couldn’t load the sound library.
              </p>
              <p className="mt-2 text-sm">
                {error} Check the database and storage setup, then try again.
              </p>
              <Button
                type="button"
                onClick={() => setRetry((value) => value + 1)}
                variant="secondary"
                size="sm"
                className="mt-4 bg-rose-700 text-white hover:bg-rose-600 dark:bg-rose-700 dark:text-white"
              >
                Retry
              </Button>
            </div>
          ) : sounds.length ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {sounds.map((sound, index) => (
                  <SoundTile key={sound._id} sound={sound} index={index} />
                ))}
                {loading &&
                  Array.from({ length: 4 }, (_, index) => (
                    <SoundTileSkeleton key={`skeleton-${index}`} />
                  ))}
              </div>
              {hasMore && (
                <div className="mt-8 text-center">
                  <Button
                    type="button"
                    onClick={loadMoreSounds}
                    disabled={loading}
                    variant="secondary"
                    size="lg"
                  >
                    Load more sounds
                  </Button>
                </div>
              )}
            </>
          ) : loading ? (
            <SoundTileSkeletonGrid count={8} />
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">
              <p className="text-lg font-semibold">No sounds here yet.</p>
              <p className="mt-2 text-sm text-slate-500">
                Try a different search or check back after creators share new
                sounds.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
