"use client"

import type { FormEvent } from "react"

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
    <AdminPage title="Manage categories" error={error}>
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
      <form
        onSubmit={createCategory}
        className="my-6 flex flex-col gap-4 rounded-xl border bg-card p-4 sm:flex-row sm:items-end"
      >
        <FieldGroup className="grid flex-1 gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="category-name">Category name</FieldLabel>
            <Input
              id="category-name"
              required
              minLength={2}
              maxLength={40}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Category name"
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
              placeholder="Short description"
            />
          </Field>
        </FieldGroup>
        <Button type="submit" size="sm">
          Add category
        </Button>
      </form>
      <AdminList
        loading={loading}
        error={error}
        count={rows.length}
        emptyMessage="Nothing to show yet."
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row: AdminRecord) => {
              const id = adminText(row._id)
              return (
                <TableRow key={id}>
                  <TableCell className="font-medium">
                    {adminText(row.name)}
                  </TableCell>
                  <TableCell className="whitespace-normal">
                    {adminText(row.description)}
                  </TableCell>
                  <TableCell>{adminText(row.slug)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      onClick={() => void mutate("category.delete", id)}
                      variant="destructive"
                      size="sm"
                    >
                      Delete
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
