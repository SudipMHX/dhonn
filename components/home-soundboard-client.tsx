"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ArrowRight, AudioLines, Flame, Music2, Search, Sparkles, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { SoundCardData, SoundTile } from "@/components/sound-tile"

type Category = { _id: string; name: string; slug: string }
type SoundResponse = { sounds: SoundCardData[]; hasMore: boolean }
type Sort = "trending" | "popular" | "newest" | "favorites"

function SoundTileSkeleton() {
  return (
    <div className="flex flex-col justify-between rounded-xl border border-border/60 bg-card p-3 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3.5 w-14 rounded-md" />
        <Skeleton className="h-3 w-7 rounded-md" />
      </div>
      <div className="flex justify-center py-2">
        <Skeleton className="size-12 rounded-xl" />
      </div>
      <div className="flex h-8 items-center justify-center">
        <Skeleton className="h-3.5 w-4/5 mx-auto rounded-md" />
      </div>
      <div className="flex items-center justify-between border-t border-border/40 pt-2">
        <Skeleton className="h-3 w-8 rounded-md" />
        <div className="flex gap-1">
          <Skeleton className="size-7 rounded-md" />
          <Skeleton className="size-7 rounded-md" />
          <Skeleton className="size-7 rounded-md" />
        </div>
      </div>
    </div>
  )
}

function SoundTileSkeletonGrid({ count }: { count: number }) {
  return (
    <div aria-busy="true" className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
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
          limit: "18",
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
                ? fetch("/api/sounds?featured=true&sort=popular&limit=6", {
                    signal: controller.signal,
                  })
                : Promise.resolve(null),
              discovery
                ? fetch("/api/sounds?sort=newest&limit=6", {
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
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Hero Section */}
        <section className="hidden lg:block relative overflow-hidden rounded-3xl border border-border/80 bg-card p-6 shadow-xs sm:p-10 lg:p-12">
          {/* Subtle Ambient Light Gradients */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 right-10 -z-10 size-96 rounded-full bg-indigo-500/10 blur-[100px] dark:bg-indigo-500/15"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 left-10 -z-10 size-80 rounded-full bg-violet-500/10 blur-[90px] dark:bg-violet-500/15"
          />

          <div className="grid gap-8 lg:grid-cols-[1.3fr_0.9fr] lg:items-center">
            <div className="flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/60 bg-indigo-50/80 px-3 py-1 text-xs font-semibold text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300 w-fit">
                <Sparkles className="size-3.5" />
                <span>The Premier Creator Soundboard</span>
              </div>

              <h1 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-foreground leading-[1.1]">
                {pageTitle ?? (
                  <>
                    Little sounds.
                    <br />
                    <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-500 bg-clip-text text-transparent dark:from-indigo-400 dark:via-indigo-300 dark:to-violet-400">
                      Instant reactions.
                    </span>
                  </>
                )}
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                {pageDescription ??
                  "Explore, play, and collect instant audio bites for streams, Discord, group chats, and videos. Quick, creator-made, and always ready."}
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <a
                  href="#library"
                  className="inline-flex h-10 items-center justify-center rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-xs shadow-indigo-600/30 transition-all hover:bg-indigo-500 active:bg-indigo-700"
                >
                  <span>Explore Sounds</span>
                  <ArrowRight className="ml-1.5 size-4" />
                </a>
                <Link
                  href="/dashboard/upload"
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-border/80 bg-secondary/60 px-5 text-sm font-medium text-foreground transition-colors hover:bg-secondary active:bg-secondary/80"
                >
                  <Upload className="mr-1.5 size-4 text-muted-foreground" />
                  <span>Share Your Audio</span>
                </Link>
              </div>
            </div>

            {/* Ambient Soundboard Showcase Card */}
            <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-zinc-950 p-6 text-white shadow-xl dark:border-border/60">
              <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                <span className="flex items-center gap-1.5 text-indigo-400 font-semibold tracking-wider uppercase">
                  <Flame className="size-3.5" />
                  <span>Trending Shelf</span>
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] text-zinc-300">
                  ONE-CLICK AUDIO
                </span>
              </div>

              {/* Animated waveform visualizer bars */}
              <div
                className="my-6 flex h-24 items-end gap-1.5 overflow-hidden"
                aria-hidden="true"
              >
                {[
                  28, 48, 35, 72, 45, 88, 38, 64, 30, 75, 52, 94, 32, 60, 42,
                  78, 30, 68, 46, 82, 36, 58, 25, 70, 44,
                ].map((height, index) => (
                  <span
                    key={index}
                    className="flex-1 rounded-full bg-gradient-to-t from-indigo-500 via-indigo-400 to-violet-300 opacity-90 transition-all duration-300"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                <div>
                  <p className="font-semibold text-white">Tap any tile to trigger</p>
                  <p className="text-zinc-400 text-[11px]">Lossless playback &amp; instant link copying</p>
                </div>
                <div className="flex items-center gap-1 text-indigo-400 font-mono">
                  <AudioLines className="size-4" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Sounds Section */}
        {!query && !category && (featured.length > 0 || loading) && (
          <section className="mt-12">
            <div className="mb-5 flex items-end justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-indigo-600 uppercase dark:text-indigo-400">
                  <Sparkles className="size-3.5" />
                  <span>Curated Selection</span>
                </div>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  Featured Sounds
                </h2>
              </div>
              <Link
                href="/featured"
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400"
              >
                <span>View all</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </div>

            {featured.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {featured.map((sound, index) => (
                  <SoundTile key={sound._id} sound={sound} index={index} />
                ))}
              </div>
            ) : (
              <div
                aria-busy="true"
                className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
              >
                {Array.from({ length: 6 }, (_, index) => (
                  <SoundTileSkeleton key={index} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Recently Added Section */}
        {!query && !category && (recent.length > 0 || loading) && (
          <section className="mt-12">
            <div className="mb-5 flex items-end justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-emerald-600 uppercase dark:text-emerald-400">
                  <Flame className="size-3.5" />
                  <span>Fresh Community Drops</span>
                </div>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  Recently Added
                </h2>
              </div>
              <Link
                href="/search?sort=newest"
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400"
              >
                <span>See latest</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </div>

            {recent.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {recent.map((sound, index) => (
                  <SoundTile
                    key={sound._id}
                    sound={sound}
                    index={index + 1}
                  />
                ))}
              </div>
            ) : (
              <div
                aria-busy="true"
                className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
              >
                {Array.from({ length: 6 }, (_, index) => (
                  <SoundTileSkeleton key={index} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Main Soundboard Library Section */}
        <section id="library" className="mt-14 scroll-mt-24">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-wider text-indigo-600 uppercase dark:text-indigo-400">
                Explore The Library
              </p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                All Sounds
              </h2>
            </div>

            {/* Instant Filter Search Bar */}
            <div className="relative w-full md:max-w-xs">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(event) =>
                  changeFilter(() => setQuery(event.target.value))
                }
                placeholder="Search sounds or tags..."
                className="h-10 w-full rounded-xl border border-input bg-card pr-4 pl-10 text-sm text-foreground transition-all placeholder:text-muted-foreground/70 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
              />
            </div>
          </div>

          {/* Category Chip Carousel */}
          <div
            aria-busy={loading && categories.length === 0}
            className="mb-5 flex flex-wrap gap-2 text-xs"
          >
            {categories.length === 0 && loading ? (
              Array.from({ length: 6 }, (_, index) => (
                <Skeleton key={index} className="h-8 w-20 rounded-xl" />
              ))
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => changeFilter(() => setCategory(""))}
                  aria-pressed={!category}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-medium transition-all ${
                    !category
                      ? "bg-indigo-600 text-white shadow-xs shadow-indigo-600/30"
                      : "border border-border/80 bg-card text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  All Sounds
                </button>
                {categories.map((item) => (
                  <button
                    key={item.slug}
                    type="button"
                    onClick={() => changeFilter(() => setCategory(item._id))}
                    aria-pressed={category === item._id}
                    className={`rounded-xl px-3.5 py-1.5 text-xs font-medium transition-all ${
                      category === item._id
                        ? "bg-indigo-600 text-white shadow-xs shadow-indigo-600/30"
                        : "border border-border/80 bg-card text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </>
            )}
          </div>

          {/* Result Count & Sorter Bar */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-y border-border/60 py-3 text-xs text-muted-foreground">
            <div>
              {loading && sounds.length === 0 ? (
                <Skeleton className="h-4 w-20" />
              ) : (
                <span className="font-medium text-foreground">
                  {sounds.length}
                  {hasMore ? "+" : ""} sounds available
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Sort by</span>
              <select
                value={sort}
                onChange={(event) =>
                  changeFilter(() => setSort(event.target.value as Sort))
                }
                className="h-8 rounded-lg border border-border/80 bg-card px-2.5 text-xs font-medium text-foreground outline-none transition-colors hover:bg-secondary focus:border-indigo-500"
              >
                <option value="trending">Trending</option>
                <option value="popular">Most played</option>
                <option value="favorites">Most favorited</option>
                <option value="newest">Recently added</option>
              </select>
            </div>
          </div>

          {/* Sound Results / Empty / Error */}
          {error ? (
            <div
              role="alert"
              className="rounded-2xl border border-rose-200/80 bg-rose-50/50 p-8 text-center text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/20 dark:text-rose-200"
            >
              <p className="font-semibold">Unable to load sound library</p>
              <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-300">
                {error}
              </p>
              <Button
                type="button"
                onClick={() => setRetry((value) => value + 1)}
                variant="destructive"
                size="sm"
                className="mt-4"
              >
                Retry
              </Button>
            </div>
          ) : sounds.length ? (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {sounds.map((sound, index) => (
                  <SoundTile key={sound._id} sound={sound} index={index} />
                ))}
                {loading &&
                  Array.from({ length: 6 }, (_, index) => (
                    <SoundTileSkeleton key={`skeleton-${index}`} />
                  ))}
              </div>
              {hasMore && (
                <div className="mt-10 text-center">
                  <Button
                    type="button"
                    onClick={loadMoreSounds}
                    disabled={loading}
                    variant="outline"
                    size="lg"
                    className="rounded-xl px-6"
                  >
                    {loading ? "Loading..." : "Load More Sounds"}
                  </Button>
                </div>
              )}
            </>
          ) : loading ? (
            <SoundTileSkeletonGrid count={12} />
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-card/40 p-12 text-center">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-muted-foreground mb-3">
                <Music2 className="size-6" />
              </div>
              <p className="font-semibold text-foreground">No sounds here yet</p>
              <p className="mt-1 max-w-sm text-xs text-muted-foreground leading-relaxed">
                Try searching for something else or explore different categories.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
