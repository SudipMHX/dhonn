"use client"

import { useEffect, useState } from "react"

import type { SoundCardData } from "@/components/sound-tile"

type SoundSort = "trending" | "popular" | "newest" | "favorites"
type SoundResponse = { sounds: SoundCardData[]; hasMore: boolean }

export function usePublicSounds({
  query = "",
  category = "",
  featured = false,
  sort = "trending",
}: {
  query?: string
  category?: string
  featured?: boolean
  sort?: SoundSort
} = {}) {
  const [sounds, setSounds] = useState<SoundCardData[]>([])
  const [hasMore, setHasMore] = useState(false)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    const timer = window.setTimeout(
      async () => {
        setLoading(true)
        setError("")
        const params = new URLSearchParams({
          q: query.trim(),
          sort,
          page: String(page),
          limit: "16",
        })
        if (category) params.set("category", category)
        if (featured) params.set("featured", "true")

        try {
          const response = await fetch(`/api/sounds?${params.toString()}`, {
            signal: controller.signal,
          })
          if (!response.ok)
            throw new Error("The sound library is temporarily unavailable.")
          const data = (await response.json()) as SoundResponse
          setSounds((current) =>
            page === 1 ? data.sounds : [...current, ...data.sounds]
          )
          setHasMore(data.hasMore)
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
      query.trim() ? 300 : 0
    )

    return () => {
      window.clearTimeout(timer)
      controller.abort()
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
