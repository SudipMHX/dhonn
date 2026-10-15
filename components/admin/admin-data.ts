"use client"

import { useEffect } from "react"

import {
  useAdminStore,
  type AdminSection,
} from "@/components/admin/admin-store"

export type { AdminRecord, AdminSection } from "@/components/admin/admin-store"
export type AdminAction = import("@/lib/actions/dashboard").AdminDashboardAction
export type AdminMutation = (
  action: AdminAction,
  id: string,
  payload?: Record<string, unknown>
) => Promise<boolean>

export function adminText(value: unknown) {
  return typeof value === "string" ? value : ""
}

export function adminChildRecord(value: unknown) {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {}
}

export function useAdminData(section: AdminSection) {
  const sectionState = useAdminStore((state) => state.sections[section])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      useAdminStore
        .getState()
        .setDebouncedSearch(section, sectionState.search.trim())
    }, 300)
    return () => window.clearTimeout(timer)
  }, [section, sectionState.search])

  useEffect(() => {
    void useAdminStore.getState().load(section)
  }, [
    section,
    sectionState.debouncedSearch,
    sectionState.status,
    sectionState.limit,
    sectionState.cursors,
    sectionState.revision,
    sectionState.loadedRequestKey,
  ])

  const page = sectionState.cursors.length
  const cursor = sectionState.cursors[page - 1] ?? null
  const loading =
    sectionState.loadedRequestKey !==
    JSON.stringify([
      sectionState.debouncedSearch,
      sectionState.status,
      sectionState.limit,
      cursor,
      sectionState.revision,
    ])

  return {
    rows: sectionState.rows,
    error: sectionState.error,
    loading,
    search: sectionState.search,
    setSearch: (value: string) =>
      useAdminStore.getState().setSearch(section, value),
    status: sectionState.status,
    setStatus: (value: string) =>
      useAdminStore.getState().setStatus(section, value),
    limit: sectionState.limit,
    setLimit: (value: number) =>
      useAdminStore.getState().setLimit(section, value),
    page,
    hasMore: sectionState.hasMore,
    goToNextPage: () => useAdminStore.getState().goToNextPage(section),
    goToPreviousPage: () => useAdminStore.getState().goToPreviousPage(section),
    mutate: (
      action: AdminAction,
      id: string,
      payload?: Record<string, unknown>
    ) => useAdminStore.getState().mutate(section, action, id, payload),
  }
}
