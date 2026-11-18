import Link from "next/link"
import { ArrowRight, Globe, Shield } from "lucide-react"

import { Button } from "@/components/ui/button"
import { AdminMenu } from "@/components/admin/admin-menu"
import { AdminNav } from "@/components/admin/admin-nav"
import { requireAdmin } from "@/lib/authz"

export const dynamic = "force-dynamic"

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const admin = await requireAdmin()

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Admin Top Header */}
      <header className="sticky top-0 z-30 border-b border-border/80 bg-card/75 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/admin"
              prefetch={false}
              className="flex items-center gap-2.5 font-heading text-sm font-bold tracking-tight text-foreground transition-opacity hover:opacity-90"
            >
              <div className="flex size-7 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs shadow-indigo-600/30">
                <Shield className="size-4" />
              </div>
              <span className="font-extrabold tracking-tight">
                Admin Console
              </span>
            </Link>

            <span className="hidden items-center gap-1.5 rounded-full border border-indigo-200/50 bg-indigo-50/60 px-2.5 py-0.5 font-mono text-[11px] text-indigo-700 sm:inline-flex dark:border-indigo-900/50 dark:bg-indigo-950/40 dark:text-indigo-300">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              <span>{admin.email}</span>
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-2 text-xs sm:gap-3">
            <Button
              nativeButton={false}
              variant="outline"
              size="xs"
              className="hidden rounded-lg sm:inline-flex"
              render={<Link href="/" />}
            >
              <Globe className="size-3 text-muted-foreground" />
              <span>Public site</span>
            </Button>

            <Button
              nativeButton={false}
              variant="outline"
              size="xs"
              className="hidden rounded-lg sm:inline-flex"
              render={<Link href="/dashboard" />}
            >
              <span>Creator dashboard</span>
              <ArrowRight className="size-3 text-muted-foreground" />
            </Button>

            <AdminMenu />
          </div>
        </div>
      </header>

      {/* Main Grid: Sidebar + Content */}
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:px-8">
        {/* Admin Navigation Sidebar */}
        <aside className="hidden flex-col lg:flex">
          <div className="sticky top-20 rounded-2xl border border-border/70 bg-card/60 p-4 shadow-xs backdrop-blur-xs">
            <AdminNav />
          </div>
        </aside>

        {/* Admin Content Area */}
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  )
}
