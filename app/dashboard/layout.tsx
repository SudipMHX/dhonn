import Link from "next/link"

import { Button } from "@/components/ui/button"
import { CreatorAccountName } from "@/components/creator/creator-account-name"
import { requireUser } from "@/lib/authz"
import { CreatorMenu } from "@/components/creator/creator-menu"

export const dynamic = "force-dynamic"

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await requireUser()
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950">
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <Link href="/" className="font-black tracking-tight">
              Creator space
            </Link>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <Button
              nativeButton={false}
              variant="link"
              size="sm"
              render={<Link href="/admin" />}
            >
              Admin dashboard →
            </Button>

            <span className="hidden text-slate-500 sm:inline">
              <CreatorAccountName name={user.name} />
            </span>

            <CreatorMenu />
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[220px_1fr]">
        <aside className="hidden gap-2 overflow-x-auto md:flex lg:flex-col">
          <Link
            href="/dashboard"
            className="rounded-xl px-4 py-3 text-sm font-medium hover:bg-white dark:hover:bg-slate-900"
          >
            Overview
          </Link>
          <Link
            href="/dashboard/upload"
            className="rounded-xl px-4 py-3 text-sm font-medium hover:bg-white dark:hover:bg-slate-900"
          >
            Upload a sound
          </Link>
          <Link
            href="/dashboard/uploads"
            className="rounded-xl px-4 py-3 text-sm font-medium hover:bg-white dark:hover:bg-slate-900"
          >
            Manage uploads
          </Link>
          <Link
            href="/dashboard/settings"
            className="rounded-xl px-4 py-3 text-sm font-medium hover:bg-white dark:hover:bg-slate-900"
          >
            Account settings
          </Link>
          <Link
            href="/"
            className="rounded-xl px-4 py-3 text-sm font-medium hover:bg-white dark:hover:bg-slate-900"
          >
            Public library
          </Link>
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  )
}
