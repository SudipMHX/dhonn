"use client"

import type { ReactNode } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronLeft, ChevronRight, Inbox, Search, X } from "lucide-react"

export function AdminPage({
  title,
  error,
  message = "",
  action,
  children,
}: {
  title: string
  error: string
  message?: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200/60 bg-indigo-50/70 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300">
            <span>Console Moderation</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {title}
          </h1>
        </div>
        {action}
      </div>

      {(error || message) && (
        <Alert variant={error ? "destructive" : "success"} className="my-4">
          <AlertDescription>{error || message}</AlertDescription>
        </Alert>
      )}

      {children}
    </section>
  )
}

export function AdminList({
  loading,
  error,
  count,
  emptyMessage,
  children,
}: {
  loading: boolean
  error: string
  count: number
  emptyMessage: string
  children: ReactNode
}) {
  if (loading) {
    return (
      <div
        className="mt-6 overflow-hidden rounded-xl border border-border/70 bg-card/60 shadow-xs"
        aria-busy="true"
      >
        {/* Table skeleton header */}
        <div className="flex h-10 items-center justify-between border-b border-border/70 bg-secondary/40 px-4">
          <Skeleton className="h-3 w-28 rounded" />
          <Skeleton className="h-3 w-20 rounded" />
          <Skeleton className="h-3 w-16 rounded" />
          <Skeleton className="h-3 w-24 rounded" />
        </div>
        {/* Skeleton rows */}
        <div className="divide-y divide-border/50">
          {Array.from({ length: 5 }, (_, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-4 px-4 py-3.5"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="size-8 rounded-lg" />
                <div className="space-y-1.5">
                  <Skeleton className="h-3.5 w-36 rounded" />
                  <Skeleton className="h-2.5 w-24 rounded" />
                </div>
              </div>
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-4 w-16 rounded" />
              <div className="flex gap-1.5">
                <Skeleton className="h-7 w-16 rounded-lg" />
                <Skeleton className="h-7 w-14 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) return null

  if (!count) {
    return (
      <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-card/40 p-12 text-center">
        <div className="flex size-11 items-center justify-center rounded-xl bg-secondary text-muted-foreground mb-3">
          <Inbox className="size-5" />
        </div>
        <p className="font-semibold text-foreground text-sm">No records found</p>
        <p className="mt-1 max-w-sm text-xs text-muted-foreground leading-relaxed">
          {emptyMessage}
        </p>
      </div>
    )
  }

  return <div className="mt-6">{children}</div>
}

export function AdminListToolbar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  statusOptions,
  limit,
  onLimitChange,
  page,
  hasMore,
  loading,
  onNextPage,
  onPreviousPage,
}: {
  search: string
  onSearchChange: (value: string) => void
  status: string
  onStatusChange: (value: string) => void
  statusOptions?: Array<{ value: string; label: string }>
  limit: number
  onLimitChange: (value: number) => void
  page: number
  hasMore: boolean
  loading: boolean
  onNextPage: () => void
  onPreviousPage: () => void
}) {
  return (
    <div className="mt-6 flex flex-col gap-4">
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        {/* Search input with clear button */}
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search records by title, user, tag..."
            aria-label="Search records"
            maxLength={100}
            className="pl-9 pr-8 h-9 text-xs"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Status Filter */}
        {statusOptions && (
          <NativeSelect
            value={status}
            onChange={(event) => onStatusChange(event.target.value)}
            aria-label="Filter by status"
            className="w-full sm:w-40 h-9 text-xs"
          >
            {statusOptions.map((option) => (
              <NativeSelectOption key={option.value} value={option.value}>
                {option.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        )}

        {/* Rows Per Page */}
        <NativeSelect
          value={String(limit)}
          onChange={(event) => onLimitChange(Number(event.target.value))}
          aria-label="Rows per page"
          className="w-full sm:ml-auto sm:w-36 h-9 text-xs"
        >
          {[10, 25, 50].map((value) => (
            <NativeSelectOption key={value} value={value}>
              {value} per page
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>

      {/* Pagination Bar */}
      <div className="flex items-center justify-between gap-3 border-t border-border/60 pt-3">
        <p className="text-xs text-muted-foreground" aria-live="polite">
          Page <span className="font-semibold text-foreground">{page}</span> ·{" "}
          <span className="font-mono">{limit}</span> records per page
        </p>

        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="xs"
            disabled={loading || page === 1}
            onClick={onPreviousPage}
            className="rounded-lg h-7 px-2.5 text-xs"
          >
            <ChevronLeft className="size-3.5" />
            <span>Previous</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="xs"
            disabled={loading || !hasMore}
            onClick={onNextPage}
            className="rounded-lg h-7 px-2.5 text-xs"
          >
            <span>Next</span>
            <ChevronRight className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
