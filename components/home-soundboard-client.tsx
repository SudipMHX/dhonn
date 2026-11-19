"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import {
  ArrowRight,
  AudioLines,
  Flame,
  Music2,
  Search,
  Sparkles,
  Upload,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { SoundCardData, SoundTile } from "@/components/sound-tile"
import { fetchCategoriesAction, fetchSoundsAction } from "@/lib/actions/sounds"
import type { HomeInitialData } from "@/lib/services/sounds"

type Category = { _id: string; name: string; slug: string }
type Sort = "trending" | "popular" | "newest" | "favorites"

function SoundTileSkeleton() {
  return (
    <div className="flex flex-col justify-between space-y-3 rounded-xl border border-border/60 bg-card p-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3.5 w-14 rounded-md" />
        <Skeleton className="h-3 w-7 rounded-md" />
      </div>
      <div className="flex justify-center py-2">
        <Skeleton className="size-12 rounded-xl" />
      </div>
      <div className="flex h-8 items-center justify-center">
        <Skeleton className="mx-auto h-3.5 w-4/5 rounded-md" />
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
    <div
      aria-busy="true"
      className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
    >
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
  initialData,
}: {
  initialQuery?: string
  initialCategory?: string
  pageTitle?: string
  pageDescription?: string
  initialData?: HomeInitialData
}) {
  const [query, setQuery] = useState(initialQuery)
  const [category, setCategory] = useState(initialCategory)
  const [sort, setSort] = useState<Sort>("trending")
  const [page, setPage] = useState(1)
  const [sounds, setSounds] = useState<SoundCardData[]>(
    initialData?.sounds ?? []
  )
  const [featured, setFeatured] = useState<SoundCardData[]>(
    initialData?.featured ?? []
  )
  const [hasMore, setHasMore] = useState(initialData?.hasMore ?? false)
  const [categories, setCategories] = useState<Category[]>(
    initialData?.categories ?? []
  )
  const [loading, setLoading] = useState(initialData ? false : true)
  const [error, setError] = useState("")
  const [retry, setRetry] = useState(0)

  const isInitialMount = useRef(Boolean(initialData))

  useEffect(() => {
    if (initialData?.categories && initialData.categories.length > 0) return
    let active = true
    fetchCategoriesAction()
      .then((data) => {
        if (active) setCategories(data)
      })
      .catch(() => {
        if (active) setError("Categories are temporarily unavailable.")
      })
    return () => {
      active = false
    }
  }, [initialData])

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }

    let active = true
    const timer = window.setTimeout(
      async () => {
        setLoading(true)
        setError("")

        try {
          const trimmed = query.trim()
          const discovery = page === 1 && !trimmed && !category
          const [soundsRes, featuredRes] = await Promise.all([
            fetchSoundsAction({
              q: trimmed || undefined,
              category: category || undefined,
              sort,
              page,
              limit: 18,
            }),
            discovery
              ? fetchSoundsAction({
                  featured: true,
                  sort: "popular",
                  limit: 6,
                  page: 1,
                })
              : Promise.resolve(null),
          ])

          if (!active) return

          setSounds((current) =>
            page === 1 ? soundsRes.sounds : [...current, ...soundsRes.sounds]
          )
          setHasMore(soundsRes.hasMore)

          if (featuredRes) {
            setFeatured(featuredRes.sounds)
          }
        } catch (cause) {
          if (!active) return
          setError(
            cause instanceof Error
              ? cause.message
              : "The sound library is temporarily unavailable."
          )
        } finally {
          if (active) setLoading(false)
        }
      },
      query.trim() ? 300 : 0
    )

    return () => {
      active = false
      window.clearTimeout(timer)
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
      <main className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-8 lg:px-8">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-2xl border border-border/80 bg-card p-5 shadow-xs sm:rounded-3xl sm:p-8 lg:p-12">
          {/* Subtle Ambient Light Gradients */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 right-10 -z-10 size-96 rounded-full bg-indigo-500/10 blur-[100px] dark:bg-indigo-500/15"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 left-10 -z-10 size-80 rounded-full bg-violet-500/10 blur-[90px] dark:bg-violet-500/15"
          />

          <div className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr] lg:items-center lg:gap-8">
            <div className="flex flex-col justify-center">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-indigo-200/60 bg-indigo-50/80 px-2.5 py-1 text-xs font-semibold text-indigo-700 sm:px-3 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300">
                <Sparkles className="size-3.5" />
                <span>The Premier Creator Soundboard</span>
              </div>

              <h1 className="mt-3 text-2xl leading-[1.15] font-extrabold tracking-tight text-foreground sm:mt-5 sm:text-4xl lg:text-6xl">
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

              <p className="mt-3 max-w-xl text-xs leading-relaxed text-muted-foreground sm:mt-4 sm:text-base">
                {pageDescription ??
                  "Explore, play, and collect instant audio bites for streams, Discord, group chats, and videos. Quick, creator-made, and always ready."}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-2.5 sm:mt-7 sm:gap-3">
                <a
                  href="#library"
                  className="inline-flex h-10 touch-manipulation items-center justify-center rounded-xl bg-indigo-600 px-4 text-xs font-semibold text-white shadow-xs shadow-indigo-600/30 transition-all hover:bg-indigo-500 active:scale-95 sm:px-5 sm:text-sm"
                >
                  <span>Explore Sounds</span>
                  <ArrowRight className="ml-1.5 size-4" />
                </a>
                <Link
                  href="/dashboard/upload"
                  className="inline-flex h-10 touch-manipulation items-center justify-center rounded-xl border border-border/80 bg-secondary/60 px-4 text-xs font-medium text-foreground transition-colors hover:bg-secondary active:scale-95 sm:px-5 sm:text-sm"
                >
                  <Upload className="mr-1.5 size-4 text-muted-foreground" />
                  <span>Share Your Audio</span>
                </Link>
              </div>
            </div>

            {/* Ambient Soundboard Showcase Card (Desktop) */}
            <div className="relative hidden overflow-hidden rounded-2xl border border-border/80 bg-zinc-950 p-6 text-white shadow-xl lg:block dark:border-border/60">
              <div className="flex items-center justify-between font-mono text-xs text-zinc-400">
                <span className="flex items-center gap-1.5 font-semibold tracking-wider text-indigo-400 uppercase">
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

              <div className="flex items-center justify-between border-t border-white/10 pt-2 text-xs">
                <div>
                  <p className="font-semibold text-white">
                    Tap any tile to trigger
                  </p>
                  <p className="text-[11px] text-zinc-400">
                    Lossless playback &amp; instant link copying
                  </p>
                </div>
                <div className="flex items-center gap-1 font-mono text-indigo-400">
                  <AudioLines className="size-4" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Sounds Section */}
        {!query && !category && (featured.length > 0 || loading) && (
          <section className="mt-8 sm:mt-10 md:mt-12">
            <div className="mb-4 flex items-end justify-between sm:mb-5">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-indigo-600 uppercase dark:text-indigo-400">
                  <Sparkles className="size-3.5" />
                  <span>Curated Selection</span>
                </div>
                <h2 className="mt-1 text-xl font-bold tracking-tight text-foreground sm:text-2xl md:text-3xl">
                  Featured Sounds
                </h2>
              </div>
              <Link
                href="/featured"
                className="inline-flex touch-manipulation items-center gap-1 text-xs font-semibold text-indigo-600 transition-colors hover:text-indigo-500 active:scale-95 dark:text-indigo-400"
              >
                <span>View all</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </div>

            {featured.length > 0 ? (
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {featured.map((sound, index) => (
                  <SoundTile key={sound._id} sound={sound} index={index} />
                ))}
              </div>
            ) : (
              <div
                aria-busy="true"
                className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
              >
                {Array.from({ length: 6 }, (_, index) => (
                  <SoundTileSkeleton key={index} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Main Soundboard Library Section */}
        <section id="library" className="mt-10 scroll-mt-24 sm:mt-14">
          <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
            <div>
              <p className="text-xs font-semibold tracking-wider text-indigo-600 uppercase dark:text-indigo-400">
                Explore The Library
              </p>
              <h2 className="mt-1 text-xl font-bold tracking-tight text-foreground sm:text-2xl md:text-3xl">
                All Sounds
              </h2>
            </div>

            {/* Instant Filter Search Bar */}
            <div className="relative w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
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

          {/* Category Chip Carousel (Smooth horizontal scroll on mobile) */}
          <div
            aria-busy={loading && categories.length === 0}
            className="-mx-3 mb-5 flex scrollbar-none items-center gap-2 overflow-x-auto px-3 py-1 text-xs sm:mx-0 sm:flex-wrap sm:px-0 sm:py-0"
          >
            {categories.length === 0 && loading ? (
              Array.from({ length: 6 }, (_, index) => (
                <Skeleton
                  key={index}
                  className="h-8 w-20 shrink-0 rounded-xl"
                />
              ))
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => changeFilter(() => setCategory(""))}
                  aria-pressed={!category}
                  className={`shrink-0 touch-manipulation rounded-xl px-3.5 py-1.5 text-xs font-medium whitespace-nowrap transition-all active:scale-95 ${
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
                    className={`shrink-0 touch-manipulation rounded-xl px-3.5 py-1.5 text-xs font-medium whitespace-nowrap transition-all active:scale-95 ${
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
                className="h-8 rounded-lg border border-border/80 bg-card px-2.5 text-xs font-medium text-foreground transition-colors outline-none hover:bg-secondary focus:border-indigo-500"
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
              className="rounded-2xl border border-rose-200/80 bg-rose-50/50 p-6 text-center text-rose-800 sm:p-8 dark:border-rose-900/60 dark:bg-rose-950/20 dark:text-rose-200"
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
                className="mt-4 touch-manipulation active:scale-95"
              >
                Retry
              </Button>
            </div>
          ) : sounds.length ? (
            <>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
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
                    className="w-full touch-manipulation rounded-xl px-6 active:scale-95 sm:w-auto"
                  >
                    {loading ? "Loading..." : "Load More Sounds"}
                  </Button>
                </div>
              )}
            </>
          ) : loading ? (
            <SoundTileSkeletonGrid count={12} />
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-card/40 p-8 text-center sm:p-12">
              <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
                <Music2 className="size-6" />
              </div>
              <p className="font-semibold text-foreground">
                No sounds here yet
              </p>
              <p className="mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">
                Try searching for something else or explore different
                categories.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
