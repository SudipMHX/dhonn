"use client"

import { Check, ShieldAlert, User as UserIcon } from "lucide-react"

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
    <AdminPage title="User Accounts" error={error}>
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
        emptyMessage="No registered user accounts match the current filter."
      >
        {/* Mobile View: Cards */}
        <div className="space-y-3 sm:hidden">
          {rows.map((row: AdminRecord) => {
            const id = adminText(row._id)
            const name = adminText(row.name) || "Anonymous User"
            const email = adminText(row.email)
            const role = adminText(row.role)
            const active = row.status === "active"

            return (
              <div
                key={`user-card-${id}`}
                className="space-y-3 rounded-2xl border border-border/80 bg-card p-4 shadow-xs"
              >
                <div className="flex items-start justify-between gap-2 border-b border-border/50 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                      {name.charAt(0).toUpperCase() || (
                        <UserIcon className="size-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-foreground">
                        {name}
                      </p>
                      {email && (
                        <p className="truncate font-mono text-[11px] text-muted-foreground">
                          {email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <Badge
                      variant={role === "admin" ? "indigo" : "outline"}
                      className="text-[10px] capitalize"
                    >
                      {role}
                    </Badge>
                    <Badge
                      variant={active ? "success" : "destructive"}
                      className="py-0.2 gap-1 px-1.5 text-[10px] capitalize"
                    >
                      <span
                        className={`size-1.5 rounded-full ${
                          active ? "bg-emerald-500" : "bg-rose-500"
                        }`}
                      />
                      {active ? "Active" : "Suspended"}
                    </Badge>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={() =>
                    void mutate("user.update", id, {
                      status: active ? "suspended" : "active",
                    })
                  }
                  variant={active ? "destructive" : "primary"}
                  size="xs"
                  className="min-h-[40px] w-full gap-1.5 rounded-xl text-xs active:scale-95"
                >
                  {active ? (
                    <>
                      <ShieldAlert className="size-3.5" />
                      <span>Suspend Account</span>
                    </>
                  ) : (
                    <>
                      <Check className="size-3.5" />
                      <span>Reactivate Account</span>
                    </>
                  )}
                </Button>
              </div>
            )
          })}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden sm:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email Address</TableHead>
                <TableHead>System Role</TableHead>
                <TableHead>Account Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row: AdminRecord) => {
                const id = adminText(row._id)
                const name = adminText(row.name) || "Anonymous User"
                const email = adminText(row.email)
                const role = adminText(row.role)
                const active = row.status === "active"

                return (
                  <TableRow key={id}>
                    {/* User with avatar circle */}
                    <TableCell className="font-semibold text-foreground">
                      <div className="flex items-center gap-2.5">
                        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                          {name.charAt(0).toUpperCase() || (
                            <UserIcon className="size-3.5" />
                          )}
                        </div>
                        <span>{name}</span>
                      </div>
                    </TableCell>

                    {/* Email */}
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {email}
                    </TableCell>

                    {/* Role */}
                    <TableCell>
                      <Badge
                        variant={role === "admin" ? "indigo" : "outline"}
                        className="text-[11px] capitalize"
                      >
                        {role}
                      </Badge>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Badge
                        variant={active ? "success" : "destructive"}
                        className="gap-1.5 text-[11px] capitalize"
                      >
                        <span
                          className={`size-1.5 rounded-full ${
                            active ? "bg-emerald-500" : "bg-rose-500"
                          }`}
                        />
                        {active ? "Active" : "Suspended"}
                      </Badge>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        onClick={() =>
                          void mutate("user.update", id, {
                            status: active ? "suspended" : "active",
                          })
                        }
                        variant={active ? "destructive" : "primary"}
                        size="xs"
                        className="min-h-[34px] gap-1 rounded-lg px-2.5 active:scale-95"
                      >
                        {active ? (
                          <>
                            <ShieldAlert className="size-3" />
                            <span>Suspend</span>
                          </>
                        ) : (
                          <>
                            <Check className="size-3" />
                            <span>Reactivate</span>
                          </>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </AdminList>
    </AdminPage>
  )
}
