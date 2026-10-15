import Link from "next/link"

import { Button } from "@/components/ui/button"
import { AdminMenu } from "@/components/admin/admin-menu"
import { requireAdmin } from "@/lib/authz"

export const dynamic = "force-dynamic"

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const admin = await requireAdmin()

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950">
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/admin"
              prefetch={false}
              className="shrink-0 font-black tracking-tight"
            >
              Admin
            </Link>

            <span className="hidden truncate text-xs text-slate-500 sm:inline">
              {admin.email}
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            <Button
              nativeButton={false}
              variant="link"
              size="sm"
              className="hidden sm:inline-flex"
              render={<Link href="/dashboard" />}
            >
              Creator dashboard →
            </Button>

            <AdminMenu />
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[220px_1fr]">
        <aside className="hidden gap-2 lg:flex lg:flex-col">
          <Link
            href="/admin"
            prefetch={false}
            className="rounded-xl px-4 py-3 text-sm font-medium hover:bg-white dark:hover:bg-slate-900"
          >
            Overview
          </Link>

          <Link
            href="/admin/uploads"
            prefetch={false}
            className="rounded-xl px-4 py-3 text-sm font-medium hover:bg-white dark:hover:bg-slate-900"
          >
            Review uploads
          </Link>

          <Link
            href="/admin/sounds"
            prefetch={false}
            className="rounded-xl px-4 py-3 text-sm font-medium hover:bg-white dark:hover:bg-slate-900"
          >
            Manage sounds
          </Link>

          <Link
            href="/admin/reports"
            prefetch={false}
            className="rounded-xl px-4 py-3 text-sm font-medium hover:bg-white dark:hover:bg-slate-900"
          >
            Reports
          </Link>

          <Link
            href="/admin/categories"
            prefetch={false}
            className="rounded-xl px-4 py-3 text-sm font-medium hover:bg-white dark:hover:bg-slate-900"
          >
            Categories
          </Link>

          <Link
            href="/admin/users"
            prefetch={false}
            className="rounded-xl px-4 py-3 text-sm font-medium hover:bg-white dark:hover:bg-slate-900"
          >
            Users
          </Link>
        </aside>

        <main className="min-w-0">{children}</main>
      </div>
    </div>
  )
}
