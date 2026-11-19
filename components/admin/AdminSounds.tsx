"use client"

import {
  AdminList,
  AdminListToolbar,
  AdminPage,
} from "@/components/admin/admin-page"
import {
  AdminSoundCard,
  AdminSoundMobileCard,
} from "@/components/admin/admin-sound-card"
import { useAdminData, type AdminRecord } from "@/components/admin/admin-data"
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { SoundRemovalDialog } from "@/components/admin/sound-removal-dialog"
import { useAdminStore } from "@/components/admin/admin-store"

export function AdminSounds() {
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
  } = useAdminData("sounds")
  const pendingRemoval = useAdminStore((state) => state.pendingRemoval)
  const setPendingRemoval = useAdminStore((state) => state.setPendingRemoval)

  return (
    <AdminPage title="Manage sounds" error={error}>
      <AdminListToolbar
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        statusOptions={[
          { value: "all", label: "All statuses" },
          { value: "pending", label: "Pending" },
          { value: "published", label: "Published" },
          { value: "rejected", label: "Rejected" },
          { value: "removed", label: "Removed" },
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
        {/* Mobile View: Cards */}
        <div className="space-y-3.5 md:hidden">
          {rows.map((row: AdminRecord) => (
            <AdminSoundMobileCard
              key={`m-${String(row._id)}`}
              row={row}
              allowPublish={false}
              mutate={mutate}
              onRemove={setPendingRemoval}
            />
          ))}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sound</TableHead>
                <TableHead>Creator</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Activity</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row: AdminRecord) => (
                <AdminSoundCard
                  key={String(row._id)}
                  row={row}
                  allowPublish={false}
                  mutate={mutate}
                  onRemove={setPendingRemoval}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </AdminList>
    </AdminPage>
  )
}
