"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function AdminUsers() {
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
  } = useAdminData("users")

  return (
    <AdminPage title="Manage users" error={error}>
      <AdminListToolbar
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        statusOptions={[
          { value: "all", label: "All statuses" },
          { value: "active", label: "Active" },
          { value: "suspended", label: "Suspended" },
        ]}
        limit={limit}
        onLimitChange={setLimit}
        page={page}
        hasMore={hasMore}
        loading={loading}
        onNextPage={goToNextPage}
        onPreviousPage={goToPreviousPage}
      />
      <AdminList
        loading={loading}
        error={error}
        count={rows.length}
        emptyMessage="Nothing to show yet."
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row: AdminRecord) => {
              const id = adminText(row._id)
              const active = row.status === "active"
              return (
                <TableRow key={id}>
                  <TableCell className="font-medium">
                    {adminText(row.name)}
                  </TableCell>
                  <TableCell>{adminText(row.email)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{adminText(row.role)}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={active ? "secondary" : "destructive"}>
                      {adminText(row.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      onClick={() =>
                        void mutate("user.update", id, {
                          status: active ? "suspended" : "active",
                        })
                      }
                      variant="outline"
                      size="sm"
                    >
                      {active ? "Suspend" : "Reactivate"}
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
