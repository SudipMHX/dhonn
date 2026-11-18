"use client"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { SoundTile, type SoundCardData } from "@/components/sound-tile"
import { Music2 } from "lucide-react"

export function PublicSoundResults({
  sounds,
  hasMore,
  loading,
  error,
  onLoadMore,
  onRetry,
}: {
  sounds: SoundCardData[]
  hasMore: boolean
  loading: boolean
  error: string
  onLoadMore?: () => void
  onRetry: () => void
}) {
  if (error) {
    return (
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
          onClick={onRetry}
          variant="destructive"
          size="sm"
          className="mt-4"
        >
          Try Again
        </Button>
      </div>
    )
  }

  if (sounds.length > 0) {
    return (
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
        {hasMore && onLoadMore && (
          <div className="mt-10 text-center">
            <Button
              type="button"
              onClick={onLoadMore}
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
    )
  }

  if (loading) {
    return (
      <div
        aria-busy="true"
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
      >
        {Array.from({ length: 12 }, (_, index) => (
          <SoundTileSkeleton key={index} />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-card/40 p-12 text-center">
      <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
        <Music2 className="size-6" />
      </div>
      <p className="font-semibold text-foreground">No sounds found</p>
      <p className="mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">
        Try adjusting your search terms or filters to find what you&apos;re
        looking for.
      </p>
    </div>
  )
}

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
