import Link from "next/link"
import { Globe, Shield, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { CreatorAccountName } from "@/components/creator/creator-account-name"
import { CreatorMenu } from "@/components/creator/creator-menu"
import { DashboardMobileNav } from "@/components/creator/dashboard-mobile-nav"
import { DashboardNav } from "@/components/creator/dashboard-nav"
import { requireUser } from "@/lib/authz"

export const dynamic = "force-dynamic"

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await requireUser()

  return (
    <div className="min-h-screen bg-background pb-[calc(5rem+env(safe-area-inset-bottom))] text-foreground lg:pb-12">
      {/* Dashboard Subheader */}
      <header className="sticky top-0 z-30 border-b border-border/80 bg-card/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-2.5 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 font-heading text-sm font-bold tracking-tight text-foreground transition-opacity hover:opacity-90 active:scale-95 sm:gap-2.5"
            >
              <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs shadow-indigo-600/30">
                <Sparkles className="size-4" />
              </div>
              <span className="truncate font-extrabold tracking-tight">
                Creator Studio
              </span>
            </Link>

            <span className="hidden items-center gap-1.5 rounded-full border border-border/60 bg-secondary/50 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground sm:inline-flex">
              <CreatorAccountName name={user.name} />
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

            {user.role === "admin" && (
              <Button
                variant="outline"
                size="xs"
                render={<Link href="/admin" />}
                className="hidden rounded-lg border-indigo-200/60 bg-indigo-50/50 text-indigo-700 hover:bg-indigo-100/70 sm:inline-flex dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300 hover:dark:bg-indigo-800/50"
              >
                <Shield className="size-3 text-indigo-600 dark:text-indigo-400" />
                <span>Admin Console</span>
              </Button>
            )}

            <CreatorMenu isAdmin={user.role === "admin"} />
          </div>
        </div>
      </header>

      {/* Main Grid: Sidebar + Content */}
      <div className="mx-auto max-w-7xl px-3 pt-3 sm:px-6 lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-8 lg:px-8 lg:pt-8">
        {/* Sidebar Nav (Desktop) */}
        <aside className="hidden flex-col lg:flex">
          <div className="sticky top-20 rounded-2xl border border-border/70 bg-card/60 p-4 shadow-xs backdrop-blur-xs">
            <DashboardNav />
          </div>
        </aside>

        {/* Content Area + Mobile Navigation */}
        <main className="min-w-0">
          <DashboardMobileNav />
          {children}
        </main>
      </div>
    </div>
  )
}
