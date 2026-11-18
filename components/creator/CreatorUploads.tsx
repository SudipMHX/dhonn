"use client"

import { useEffect } from "react"
import { ChevronLeft, ChevronRight, Inbox, Search, X } from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CreatorUploadRow } from "./creator-upload-row"
import { useCreatorUploads } from "./creator-upload-data"
import { useCreatorStore } from "@/components/creator/creator-store"

export function CreatorUploads() {
  const uploads = useCreatorUploads()
  const categories = useCreatorStore((state) => state.categories)
  const categoryError = useCreatorStore((state) => state.categoryError)

  useEffect(() => {
    void useCreatorStore.getState().loadCategories()
  }, [])

  return (
    <div className="space-y-6">
      {categoryError && (
        <Alert variant="destructive">
          <AlertDescription>{categoryError}</AlertDescription>
        </Alert>
      )}
      {uploads.error && (
        <Alert variant="destructive">
          <AlertDescription>{uploads.error}</AlertDescription>
        </Alert>
      )}

      {/* Toolbar */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        {/* Search input with clear button */}
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={uploads.search}
            onChange={(event) => uploads.setSearch(event.target.value)}
            placeholder="Search your uploads by title..."
            aria-label="Search your uploads"
            maxLength={100}
            className="h-9 pr-8 pl-9 text-xs"
          />
          {uploads.search && (
            <button
              type="button"
              onClick={() => uploads.setSearch("")}
              aria-label="Clear search"
              className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Status Filter */}
        <NativeSelect
          value={uploads.status}
          onChange={(event) => uploads.setStatus(event.target.value)}
          aria-label="Filter uploads by status"
          className="h-9 w-full text-xs sm:w-44"
        >
          <NativeSelectOption value="all">All statuses</NativeSelectOption>
          <NativeSelectOption value="uploading">Uploading</NativeSelectOption>
          <NativeSelectOption value="pending">
            Pending review
          </NativeSelectOption>
          <NativeSelectOption value="published">Published</NativeSelectOption>
          <NativeSelectOption value="rejected">Rejected</NativeSelectOption>
          <NativeSelectOption value="removed">Removed</NativeSelectOption>
        </NativeSelect>

        {/* Rows Per Page */}
        <NativeSelect
          value={String(uploads.limit)}
          onChange={(event) => uploads.setLimit(Number(event.target.value))}
          aria-label="Uploads per page"
          className="h-9 w-full text-xs sm:ml-auto sm:w-36"
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
          Page{" "}
          <span className="font-semibold text-foreground">{uploads.page}</span>{" "}
          · <span className="font-mono">{uploads.limit}</span> records per page
        </p>

        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="xs"
            disabled={uploads.loading || uploads.page === 1}
            onClick={uploads.goToPreviousPage}
            className="h-7 rounded-lg px-2.5 text-xs"
          >
            <ChevronLeft className="size-3.5" />
            <span>Previous</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="xs"
            disabled={uploads.loading || !uploads.hasMore}
            onClick={uploads.goToNextPage}
            className="h-7 rounded-lg px-2.5 text-xs"
          >
            <span>Next</span>
            <ChevronRight className="size-3.5" />
          </Button>
        </div>
      </div>

      {uploads.loading ? (
        <div
          className="overflow-hidden rounded-xl border border-border/70 bg-card/60 shadow-xs"
          aria-busy="true"
        >
          <div className="flex h-10 items-center justify-between border-b border-border/70 bg-secondary/40 px-4">
            <Skeleton className="h-3 w-28 rounded" />
            <Skeleton className="h-3 w-20 rounded" />
            <Skeleton className="h-3 w-16 rounded" />
            <Skeleton className="h-3 w-20 rounded" />
          </div>
          <div className="divide-y divide-border/50">
            {Array.from({ length: 4 }, (_, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-4 px-4 py-3.5"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="size-7 rounded-lg" />
                  <Skeleton className="h-4 w-36 rounded" />
                </div>
                <Skeleton className="h-5 w-20 rounded-md" />
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-7 w-16 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      ) : uploads.error ? null : !uploads.items.length ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-card/40 p-12 text-center">
          <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
            <Inbox className="size-5" />
          </div>
          <p className="text-sm font-semibold text-foreground">
            No uploads found
          </p>
          <p className="mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">
            {uploads.search || uploads.status !== "all"
              ? "No uploads match the current search or status filter."
              : "You haven’t uploaded any sounds yet. Click upload to get started."}
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sound</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Moderation Note</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {uploads.items.map((upload) => (
              <CreatorUploadRow
                key={upload._id}
                upload={upload}
                categories={categories}
                categoryError={categoryError}
                onSave={(body) => uploads.mutate(upload._id, "PATCH", body)}
                onRemove={() => uploads.mutate(upload._id, "DELETE")}
              />
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
