"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

type FavoriteContextValue = {
  favorites: Set<string>
  toggleFavorite: (soundId: string) => Promise<boolean>
  error: string | null
}

const FavoriteContext = createContext<FavoriteContextValue | null>(null)
const STORAGE_KEY = "dhonn.-favorite-sounds"

export function FavoriteProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/favorites")
      .then(async (response) => {
        if (!response.ok)
          throw new Error("Favorites could not be synchronized.")
        return (await response.json()) as { soundIds: string[] | null }
      })
      .then((data) => {
        if (data.soundIds) {
          setFavorites(new Set(data.soundIds))
          return
        }
        const local = localStorage.getItem(STORAGE_KEY)
        if (!local) return
        try {
          setFavorites(new Set(JSON.parse(local) as string[]))
        } catch {
          localStorage.removeItem(STORAGE_KEY)
        }
      })
      .catch((cause: unknown) =>
        setError(
          cause instanceof Error
            ? cause.message
            : "Favorites could not be synchronized."
        )
      )
  }, [])

  const toggleFavorite = useCallback(
    async (soundId: string) => {
      setError(null)
      try {
        const response = await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ soundId }),
        })

        let next: Set<string>
        if (response.ok) {
          const result = (await response.json()) as { favorited: boolean }
          next = new Set(favorites)
          if (result.favorited) next.add(soundId)
          else next.delete(soundId)
        } else if (response.status === 401) {
          next = new Set(favorites)
          if (next.has(soundId)) next.delete(soundId)
          else next.add(soundId)
          localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]))
        } else {
          const result = (await response.json().catch(() => null)) as {
            error?: string
          } | null
          setError(result?.error ?? "Favorite could not be updated.")
          return false
        }
        setFavorites(next)
        return true
      } catch {
        setError(
          "Favorite could not be updated. Check your connection and try again."
        )
        return false
      }
    },
    [favorites]
  )

  const value = useMemo(
    () => ({ favorites, toggleFavorite, error }),
    [favorites, toggleFavorite, error]
  )
  return (
    <FavoriteContext.Provider value={value}>
      {children}
    </FavoriteContext.Provider>
  )
}

export function useFavorites() {
  const value = useContext(FavoriteContext)
  if (!value)
    throw new Error("useFavorites must be used inside FavoriteProvider.")
  return value
}
