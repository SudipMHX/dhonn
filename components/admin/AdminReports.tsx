"use client"

import { AlertTriangle, Check, Eye, Trash2, X } from "lucide-react"

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
    <AdminPage title="Reports & Copyright" error={error}>
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
        emptyMessage="No copyright or content reports match the current filters."
      >
        {/* Mobile View: Dedicated Report Cards */}
        <div className="space-y-3.5 md:hidden">
          {rows.map((row: AdminRecord) => {
            const id = adminText(row._id)
            const sound = adminChildRecord(row.sound)
            const soundTitle = adminText(sound.title) || "Removed sound"
            const soundId = adminText(sound._id)
            const reportType = adminText(row.type)
            const reporterEmail = adminText(row.email)
            const reportStatus = adminText(row.status)

            const statusVariant =
              reportStatus === "resolved"
                ? "success"
                : reportStatus === "dismissed"
                  ? "secondary"
                  : reportStatus === "reviewing"
                    ? "warning"
                    : "destructive"

            return (
              <div
                key={`report-card-${id}`}
                className="space-y-3 rounded-2xl border border-border/80 bg-card p-4 shadow-xs"
              >
                {/* Header: Title, Type badge, and Status */}
                <div className="flex items-start justify-between gap-2 border-b border-border/50 pb-2.5">
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">
                      {soundTitle}
                    </p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
                        <AlertTriangle className="size-2.5 text-amber-500" />
                        <span>{reportType || "Notice"}</span>
                      </span>
                    </div>
                  </div>

                  <Badge
                    variant={statusVariant}
                    className="shrink-0 gap-1.5 capitalize"
                  >
                    <span
                      className={`size-1.5 rounded-full ${
                        reportStatus === "resolved"
                          ? "bg-emerald-500"
                          : reportStatus === "dismissed"
                            ? "bg-zinc-400"
                            : reportStatus === "reviewing"
                              ? "bg-amber-500"
                              : "bg-rose-500"
                      }`}
                    />
                    {reportStatus}
                  </Badge>
                </div>

                {/* Reporter and Description */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Reporter:</span>
                    <span className="font-mono text-foreground">
                      {reporterEmail || "Anonymous"}
                    </span>
                  </div>

                  {adminText(row.details) && (
                    <div className="rounded-xl border border-border/50 bg-secondary/30 p-2.5 text-xs leading-relaxed text-muted-foreground">
                      {adminText(row.details)}
                    </div>
                  )}
                </div>

                {/* Action Buttons: Min 40px touch height */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {reportStatus !== "reviewing" && (
                    <Button
                      type="button"
                      onClick={() =>
                        void mutate("report.update", id, {
                          status: "reviewing",
                        })
                      }
                      variant="outline"
                      size="xs"
                      className="min-h-[40px] flex-1 gap-1.5 rounded-xl text-xs active:scale-95"
                    >
                      <Eye className="size-3.5" />
                      <span>Review</span>
                    </Button>
                  )}

                  {soundId && (
                    <Button
                      type="button"
                      onClick={() =>
                        setPendingRemoval({
                          soundId,
                          title: soundTitle,
                        })
                      }
                      variant="destructive"
                      size="xs"
                      className="min-h-[40px] flex-1 gap-1.5 rounded-xl text-xs active:scale-95"
                    >
                      <Trash2 className="size-3.5" />
                      <span>Remove</span>
                    </Button>
                  )}

                  {reportStatus !== "resolved" && (
                    <Button
                      type="button"
                      onClick={() =>
                        void mutate("report.update", id, {
                          status: "resolved",
                        })
                      }
                      variant="primary"
                      size="xs"
                      className="min-h-[40px] flex-1 gap-1.5 rounded-xl text-xs active:scale-95"
                    >
                      <Check className="size-3.5" />
                      <span>Resolve</span>
                    </Button>
                  )}

                  {reportStatus !== "dismissed" && (
                    <Button
                      type="button"
                      onClick={() =>
                        void mutate("report.update", id, {
                          status: "dismissed",
                        })
                      }
                      variant="outline"
                      size="xs"
                      className="min-h-[40px] flex-1 gap-1.5 rounded-xl text-xs active:scale-95"
                    >
                      <X className="size-3.5" />
                      <span>Dismiss</span>
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Target Sound</TableHead>
                <TableHead>Reporter</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Moderation Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row: AdminRecord) => {
                const id = adminText(row._id)
                const sound = adminChildRecord(row.sound)
                const soundTitle = adminText(sound.title) || "Removed sound"
                const soundId = adminText(sound._id)
                const reportType = adminText(row.type)
                const reporterEmail = adminText(row.email)
                const reportStatus = adminText(row.status)

                const statusVariant =
                  reportStatus === "resolved"
                    ? "success"
                    : reportStatus === "dismissed"
                      ? "secondary"
                      : reportStatus === "reviewing"
                        ? "warning"
                        : "destructive"

                return (
                  <TableRow key={id}>
                    {/* Target Sound & Report Type */}
                    <TableCell className="min-w-48 whitespace-normal">
                      <p className="font-semibold text-foreground">
                        {soundTitle}
                      </p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
                          <AlertTriangle className="size-2.5 text-amber-500" />
                          <span>{reportType || "Notice"}</span>
                        </span>
                      </div>
                    </TableCell>

                    {/* Reporter email */}
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {reporterEmail || "Anonymous"}
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Badge
                        variant={statusVariant}
                        className="gap-1.5 capitalize"
                      >
                        <span
                          className={`size-1.5 rounded-full ${
                            reportStatus === "resolved"
                              ? "bg-emerald-500"
                              : reportStatus === "dismissed"
                                ? "bg-zinc-400"
                                : reportStatus === "reviewing"
                                  ? "bg-amber-500"
                                  : "bg-rose-500"
                          }`}
                        />
                        {reportStatus}
                      </Badge>
                    </TableCell>

                    {/* Report details */}
                    <TableCell className="max-w-xs text-xs whitespace-normal text-muted-foreground">
                      <p className="line-clamp-2 leading-relaxed">
                        {adminText(row.details)}
                      </p>
                    </TableCell>

                    {/* Moderation Actions */}
                    <TableCell>
                      <div className="flex min-w-64 flex-wrap items-center gap-1.5">
                        {reportStatus !== "reviewing" && (
                          <Button
                            type="button"
                            onClick={() =>
                              void mutate("report.update", id, {
                                status: "reviewing",
                              })
                            }
                            variant="outline"
                            size="xs"
                            className="min-h-[36px] gap-1 rounded-lg px-2.5 active:scale-95"
                          >
                            <Eye className="size-3" />
                            <span>Review</span>
                          </Button>
                        )}

                        {soundId && (
                          <Button
                            type="button"
                            onClick={() =>
                              setPendingRemoval({
                                soundId,
                                title: soundTitle,
                              })
                            }
                            variant="destructive"
                            size="xs"
                            className="min-h-[36px] gap-1 rounded-lg px-2.5 active:scale-95"
                          >
                            <Trash2 className="size-3" />
                            <span>Remove</span>
                          </Button>
                        )}

                        {reportStatus !== "resolved" && (
                          <Button
                            type="button"
                            onClick={() =>
                              void mutate("report.update", id, {
                                status: "resolved",
                              })
                            }
                            variant="primary"
                            size="xs"
                            className="min-h-[36px] gap-1 rounded-lg px-2.5 active:scale-95"
                          >
                            <Check className="size-3" />
                            <span>Resolve</span>
                          </Button>
                        )}

                        {reportStatus !== "dismissed" && (
                          <Button
                            type="button"
                            onClick={() =>
                              void mutate("report.update", id, {
                                status: "dismissed",
                              })
                            }
                            variant="outline"
                            size="xs"
                            className="min-h-[36px] gap-1 rounded-lg px-2.5 active:scale-95"
                          >
                            <X className="size-3" />
                            <span>Dismiss</span>
                          </Button>
                        )}
                      </div>
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
