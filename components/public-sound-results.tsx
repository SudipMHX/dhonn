"use client"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { SoundTile, type SoundCardData } from "@/components/sound-tile"

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
        className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200"
      >
        <p className="font-semibold">We couldn’t load the sound library.</p>
        <p className="mt-2 text-sm">{error}</p>
        <Button
          type="button"
          onClick={onRetry}
          variant="secondary"
          size="sm"
          className="mt-4"
        >
          Retry
        </Button>
      </div>
    )
  }

  if (sounds.length > 0) {
    return (
      <>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {sounds.map((sound) => (
            <SoundTile key={sound._id} sound={sound} />
          ))}
          {loading &&
            Array.from({ length: 4 }, (_, index) => (
              <SoundTileSkeleton key={`skeleton-${index}`} />
            ))}
        </div>
        {hasMore && onLoadMore && (
          <div className="mt-8 text-center">
            <Button
              type="button"
              onClick={onLoadMore}
              disabled={loading}
              variant="secondary"
              size="lg"
            >
              Load more sounds
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
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {Array.from({ length: 8 }, (_, index) => (
          <SoundTileSkeleton key={index} />
        ))}
      </div>
    )
  }

  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">
      <p className="text-lg font-semibold">No sounds here yet.</p>
      <p className="mt-2 text-sm text-slate-500">
        Try a different search or check back after creators share new sounds.
      </p>
    </div>
  )
}

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
