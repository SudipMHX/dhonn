import type { ReactNode } from "react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Skeleton } from "@/components/ui/skeleton"

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
    <section>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">Admin tools</p>
          <h1 className="mt-1 text-3xl font-black">{title}</h1>
        </div>
        {action}
      </div>
      {(error || message) && (
        <Alert
          variant={error ? "destructive" : "default"}
          className={`mt-5 ${!error ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300" : ""}`}
        >
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
            className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <Skeleton className="h-9 w-20 rounded-full" />
          </div>
        ))}
      </div>
    )
  if (error) return null
  if (!count)
    return (
      <Card className="mt-6 border-dashed bg-transparent">
        <CardContent className="py-10 text-center text-muted-foreground">
          {emptyMessage}
        </CardContent>
      </Card>
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
    <div className="mt-6 flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search this collection…"
          aria-label="Search this collection"
          maxLength={100}
          className="sm:max-w-sm"
        />
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
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          Page {page} · {limit} per page
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={loading || page === 1}
            onClick={onPreviousPage}
          >
            Previous
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={loading || !hasMore}
            onClick={onNextPage}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
