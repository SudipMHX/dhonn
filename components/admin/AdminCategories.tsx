"use client"

import type { FormEvent } from "react"
import { Folder, FolderPlus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import {
  AdminList,
  AdminListToolbar,
  AdminPage,
} from "@/components/admin/admin-page"
import {
  adminText,
  useAdminData,
  type AdminRecord,
} from "@/components/admin/admin-data"
import { useAdminStore } from "@/components/admin/admin-store"

export function AdminCategories() {
  const {
    rows,
    error,
    loading,
    search,
    setSearch,
    status,
    setStatus,
    limit,
    setLimit,
    page,
    hasMore,
    goToNextPage,
    goToPreviousPage,
    mutate,
  } = useAdminData("categories")
  const name = useAdminStore((state) => state.categoryName)
  const description = useAdminStore((state) => state.categoryDescription)
  const setName = useAdminStore((state) => state.setCategoryName)
  const setDescription = useAdminStore((state) => state.setCategoryDescription)

  async function createCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (
      await mutate("category.create", "", {
        name,
        description,
      })
    ) {
      setName("")
      setDescription("")
    }
  }

  return (
    <AdminPage title="Manage Categories" error={error}>
      <AdminListToolbar
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        limit={limit}
        onLimitChange={setLimit}
        page={page}
        hasMore={hasMore}
        loading={loading}
        onNextPage={goToNextPage}
        onPreviousPage={goToPreviousPage}
      />

      {/* Create Category Form Card */}
      <div className="my-6 rounded-xl border border-border/80 bg-card p-5 shadow-xs">
        <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          <FolderPlus className="size-4" />
          <span>Create New Category</span>
        </div>

        <form onSubmit={createCategory} className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <FieldGroup className="grid flex-1 gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="category-name">Category Name</FieldLabel>
              <Input
                id="category-name"
                required
                minLength={2}
                maxLength={40}
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Memes, Gaming, Reactions"
                className="h-10 text-xs sm:text-sm"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="category-description">Description</FieldLabel>
              <Textarea
                id="category-description"
                maxLength={240}
                rows={1}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Short description for SEO and discovery"
                className="min-h-10 text-xs sm:text-sm resize-none"
              />
            </Field>
          </FieldGroup>
          <Button type="submit" variant="primary" size="md" className="shrink-0 gap-1.5 rounded-xl">
            <FolderPlus className="size-4" />
            <span>Add Category</span>
          </Button>
        </form>
      </div>

      <AdminList
        loading={loading}
        error={error}
        count={rows.length}
        emptyMessage="No categories created yet."
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>URL Slug</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row: AdminRecord) => {
              const id = adminText(row._id)
              return (
                <TableRow key={id}>
                  <TableCell className="font-semibold text-foreground">
                    <div className="flex items-center gap-2">
                      <div className="flex size-7 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                        <Folder className="size-3.5" />
                      </div>
                      <span>{adminText(row.name)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-md whitespace-normal text-xs text-muted-foreground leading-relaxed">
                    {adminText(row.description) || "No description provided"}
                  </TableCell>
                  <TableCell>
                    <span className="rounded-md border border-border/60 bg-secondary/60 px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
                      /{adminText(row.slug)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      onClick={() => void mutate("category.delete", id)}
                      variant="ghost"
                      size="xs"
                      className="rounded-lg text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/40"
                      title="Delete category"
                    >
                      <Trash2 className="size-3.5" />
                      <span className="hidden sm:inline ml-1">Delete</span>
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </AdminList>
    </AdminPage>
  )
}
