"use client"

import Link from "next/link"

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
import { Button } from "@/components/ui/button"
import { SoundRemovalDialog } from "@/components/admin/sound-removal-dialog"
import { useAdminStore } from "@/components/admin/admin-store"

export function AdminUploads() {
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
  } = useAdminData("uploads")
  const pendingRemoval = useAdminStore((state) => state.pendingRemoval)
  const setPendingRemoval = useAdminStore((state) => state.setPendingRemoval)

  return (
    <AdminPage
      title="Review uploads"
      error={error}
      action={
        <Button
          nativeButton={false}
          variant="outline"
          size="xs"
          className="min-h-[38px] rounded-lg text-xs"
          render={<Link href="/dashboard/upload" />}
        >
          Upload as admin
        </Button>
      }
    >
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
      <SoundRemovalDialog
        target={pendingRemoval}
        onClose={() => setPendingRemoval(null)}
        mutate={mutate}
      />
      <AdminList
        loading={loading}
        error={error}
        count={rows.length}
        emptyMessage="No submissions are waiting for review."
      >
        {/* Mobile View: Cards */}
        <div className="space-y-3.5 md:hidden">
          {rows.map((row: AdminRecord) => (
            <AdminSoundMobileCard
              key={`m-${String(row._id)}`}
              row={row}
              allowPublish
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
                  allowPublish
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
