"use client"

import { useEffect, useRef, useState } from "react"

import type { SoundCardData } from "@/components/sound-tile"
import { fetchSoundsAction } from "@/lib/actions/sounds"

type SoundSort = "trending" | "popular" | "newest" | "favorites"

export function usePublicSounds({
  query = "",
  category = "",
  featured = false,
  sort = "trending",
  initialSounds,
  initialHasMore,
}: {
  query?: string
  category?: string
  featured?: boolean
  sort?: SoundSort
  initialSounds?: SoundCardData[]
  initialHasMore?: boolean
} = {}) {
  const [sounds, setSounds] = useState<SoundCardData[]>(initialSounds ?? [])
  const [hasMore, setHasMore] = useState(initialHasMore ?? false)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(initialSounds ? false : true)
  const [error, setError] = useState("")
  const [retry, setRetry] = useState(0)

  const isInitialMount = useRef(Boolean(initialSounds))

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
          const data = await fetchSoundsAction({
            q: query.trim() || undefined,
            category: category || undefined,
            featured: featured || undefined,
            sort,
            page,
            limit: 18,
          })

          if (!active) return

          setSounds((current) =>
            page === 1 ? data.sounds : [...current, ...data.sounds]
          )
          setHasMore(data.hasMore)
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
  }, [query, category, featured, sort, page, retry])

  return {
    sounds,
    hasMore,
    loading,
    error,
    reset() {
      setSounds([])
      setHasMore(false)
      setPage(1)
      setLoading(true)
    },
    loadMore() {
      setPage((current) => current + 1)
    },
    retry() {
      setRetry((current) => current + 1)
    },
  }
}
