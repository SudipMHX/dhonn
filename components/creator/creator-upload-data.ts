"use client"

import { useEffect } from "react"
import { useShallow } from "zustand/react/shallow"

import { useCreatorStore } from "@/components/creator/creator-store"

export type {
  CreatorCategory,
  CreatorUpload,
} from "@/components/creator/creator-store"

export function useCreatorUploads() {
  const {
    items,
    search,
    setSearch,
    setDebouncedSearch,
    debouncedSearch,
    status,
    setStatus,
    limit,
    setLimit,
    cursors,
    hasMore,
    error,
    loadedRequestKey,
    loadPage,
    mutateUpload,
    goToNextPage,
    goToPreviousPage,
  } = useCreatorStore(
    useShallow((state) => ({
      items: state.items,
      search: state.search,
      setSearch: state.setSearch,
      setDebouncedSearch: state.setDebouncedSearch,
      debouncedSearch: state.debouncedSearch,
      status: state.status,
      setStatus: state.setStatus,
      limit: state.limit,
      setLimit: state.setLimit,
      cursors: state.cursors,
      hasMore: state.hasMore,
      error: state.error,
      loadedRequestKey: state.loadedRequestKey,
      loadPage: state.loadPage,
      mutateUpload: state.mutateUpload,
      goToNextPage: state.goToNextPage,
      goToPreviousPage: state.goToPreviousPage,
    }))
  )
  const page = cursors.length
  const cursor = cursors[page - 1] ?? null
  const requestKey = JSON.stringify([debouncedSearch, status, limit, cursor])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim())
    }, 300)
    return () => window.clearTimeout(timer)
  }, [search, setDebouncedSearch])

  useEffect(() => {
    void loadPage()
  }, [debouncedSearch, status, limit, cursors, loadedRequestKey, loadPage])

  const loading = loadedRequestKey !== requestKey
  return {
    items,
    search,
    setSearch,
    status,
    setStatus,
    limit,
    setLimit,
    page,
    hasMore,
    loading,
    error,
    mutate: mutateUpload,
    goToNextPage,
    goToPreviousPage,
  }
}
