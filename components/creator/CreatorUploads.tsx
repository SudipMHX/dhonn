"use client"

import { useEffect } from "react"

import { Alert, AlertDescription } from "@/components/ui/alert"
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
import { Button } from "@/components/ui/button"
import { useCreatorStore } from "@/components/creator/creator-store"

export function CreatorUploads() {
  const uploads = useCreatorUploads()
  const categories = useCreatorStore((state) => state.categories)
  const categoryError = useCreatorStore((state) => state.categoryError)

  useEffect(() => {
    void useCreatorStore.getState().loadCategories()
  }, [])

  return (
    <div className="mt-6 space-y-4">
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
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          type="search"
          value={uploads.search}
          onChange={(event) => uploads.setSearch(event.target.value)}
          placeholder="Search your uploads…"
          aria-label="Search your uploads"
          maxLength={100}
          className="sm:max-w-sm"
        />
        <NativeSelect
          value={uploads.status}
          onChange={(event) => uploads.setStatus(event.target.value)}
          aria-label="Filter uploads by status"
          className="w-full sm:w-44"
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
        <NativeSelect
          value={String(uploads.limit)}
          onChange={(event) => uploads.setLimit(Number(event.target.value))}
          aria-label="Uploads per page"
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
          Page {uploads.page} · {uploads.limit} per page
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploads.loading || uploads.page === 1}
            onClick={uploads.goToPreviousPage}
          >
            Previous
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploads.loading || !uploads.hasMore}
            onClick={uploads.goToNextPage}
          >
            Next
          </Button>
        </div>
      </div>
      {uploads.loading ? (
        <div className="space-y-3" aria-busy="true">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      ) : uploads.error ? null : (
        <div className="overflow-x-auto rounded-2xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sound</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Moderation note</TableHead>
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
              {!uploads.items.length && (
                <TableRow>
                  <TableHead
                    colSpan={5}
                    className="py-8 text-center text-muted-foreground"
                  >
                    {uploads.search || uploads.status !== "all"
                      ? "No uploads match these filters."
                      : "You haven’t uploaded any sounds yet."}
                  </TableHead>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
