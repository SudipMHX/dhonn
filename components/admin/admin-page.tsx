import type { ReactNode } from "react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronLeft, ChevronRight, Inbox, Search } from "lucide-react"

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
          <p className="text-xs font-semibold tracking-wider text-indigo-600 uppercase dark:text-indigo-400">
            Console Management
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
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
  if (loading)
    return (
      <div className="mt-6 space-y-3" aria-busy="true">
        {Array.from({ length: 3 }, (_, index) => (
          <div
            key={index}
            className="flex items-center justify-between gap-4 rounded-2xl border border-border/80 bg-card p-4"
          >
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-2/3" />
            </div>
            <Skeleton className="h-8 w-20 rounded-xl" />
          </div>
        ))}
      </div>
    )

  if (error) return null

  if (!count)
    return (
      <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-card/40 p-12 text-center">
        <div className="flex size-10 items-center justify-center rounded-xl bg-secondary text-muted-foreground mb-3">
          <Inbox className="size-5" />
        </div>
        <p className="text-xs font-medium text-muted-foreground">
          {emptyMessage}
        </p>
      </div>
    )

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
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search records..."
            aria-label="Search records"
            maxLength={100}
            className="pl-10 h-10"
          />
        </div>

        {statusOptions && (
          <NativeSelect
            value={status}
            onChange={(event) => onStatusChange(event.target.value)}
            aria-label="Filter by status"
            className="w-full sm:w-44"
          >
            {statusOptions.map((option) => (
              <NativeSelectOption key={option.value} value={option.value}>
                {option.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        )}

        <NativeSelect
          value={String(limit)}
          onChange={(event) => onLimitChange(Number(event.target.value))}
          aria-label="Rows per page"
          className="w-full sm:ml-auto sm:w-36"
        >
          {[10, 25, 50].map((value) => (
            <NativeSelectOption key={value} value={value}>
              {value} per page
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border/50 pt-3">
        <p className="text-xs text-muted-foreground" aria-live="polite">
          Showing page <span className="font-semibold text-foreground">{page}</span> · {limit} per page
        </p>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={loading || page === 1}
            onClick={onPreviousPage}
          >
            <ChevronLeft className="size-3.5" />
            <span>Previous</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={loading || !hasMore}
            onClick={onNextPage}
          >
            <span>Next</span>
            <ChevronRight className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
