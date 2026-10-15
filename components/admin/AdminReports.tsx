"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AdminList,
  AdminListToolbar,
  AdminPage,
} from "@/components/admin/admin-page"
import {
  adminChildRecord,
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
import { SoundRemovalDialog } from "@/components/admin/sound-removal-dialog"
import { useAdminStore } from "@/components/admin/admin-store"

export function AdminReports() {
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
  } = useAdminData("reports")
  const pendingRemoval = useAdminStore((state) => state.pendingRemoval)
  const setPendingRemoval = useAdminStore((state) => state.setPendingRemoval)

  return (
    <AdminPage title="Reports & copyright" error={error}>
      <AdminListToolbar
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        statusOptions={[
          { value: "all", label: "All statuses" },
          { value: "open", label: "Open" },
          { value: "reviewing", label: "Reviewing" },
          { value: "resolved", label: "Resolved" },
          { value: "dismissed", label: "Dismissed" },
        ]}
        limit={limit}
        onLimitChange={setLimit}
        page={page}
        hasMore={hasMore}
        loading={loading}
        onNextPage={goToNextPage}
        onPreviousPage={goToPreviousPage}
      />
      <SoundRemovalDialog
        target={pendingRemoval}
        onClose={() => setPendingRemoval(null)}
        mutate={mutate}
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
              <TableHead>Sound / report</TableHead>
              <TableHead>Reporter</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row: AdminRecord) => {
              const id = adminText(row._id)
              const sound = adminChildRecord(row.sound)
              return (
                <TableRow key={id}>
                  <TableCell className="whitespace-normal">
                    <p className="font-medium">
                      {adminText(sound.title) || "Removed sound"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {adminText(row.type)}
                    </p>
                  </TableCell>
                  <TableCell>{adminText(row.email)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        row.status === "resolved" || row.status === "dismissed"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {adminText(row.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-72 whitespace-normal">
                    {adminText(row.details)}
                  </TableCell>
                  <TableCell>
                    <div className="flex min-w-72 flex-wrap gap-2">
                      <Button
                        type="button"
                        onClick={() =>
                          void mutate("report.update", id, {
                            status: "reviewing",
                          })
                        }
                        variant="outline"
                        size="sm"
                      >
                        Review
                      </Button>
                      {adminText(sound._id) && (
                        <Button
                          type="button"
                          onClick={() =>
                            setPendingRemoval({
                              soundId: adminText(sound._id),
                              title: adminText(sound.title) || "this sound",
                            })
                          }
                          variant="destructive"
                          size="sm"
                        >
                          Remove sound
                        </Button>
                      )}
                      <Button
                        type="button"
                        onClick={() =>
                          void mutate("report.update", id, {
                            status: "resolved",
                          })
                        }
                        variant="default"
                        size="sm"
                      >
                        Resolve
                      </Button>
                      <Button
                        type="button"
                        onClick={() =>
                          void mutate("report.update", id, {
                            status: "dismissed",
                          })
                        }
                        variant="outline"
                        size="sm"
                      >
                        Dismiss
                      </Button>
                    </div>
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
