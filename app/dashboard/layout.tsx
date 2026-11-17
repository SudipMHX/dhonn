import Link from "next/link"
import {
  Compass,
  LayoutDashboard,
  Music,
  Settings,
  Sparkles,
  Upload,
} from "lucide-react"

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
    <div className="min-h-screen bg-background text-foreground">
      {/* Dashboard Subheader */}
      <div className="border-b border-border/80 bg-card/60 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 font-heading text-sm font-bold tracking-tight text-foreground"
            >
              <div className="flex size-6 items-center justify-center rounded-lg bg-indigo-600 text-white">
                <Sparkles className="size-3.5" />
              </div>
              <span>Creator Studio</span>
            </Link>
          </div>

          <div className="flex items-center gap-3 text-xs">
            {user.role === "admin" && (
              <Button
                variant="outline"
                size="xs"
                render={<Link href="/admin" />}
                className="hidden sm:inline-flex text-indigo-600 dark:text-indigo-400"
              >
                Admin console →
              </Button>
            )}

            <span className="hidden rounded-full border border-border/60 bg-secondary/60 px-3 py-1 font-medium text-muted-foreground sm:inline-block">
              <CreatorAccountName name={user.name} />
            </span>

            <CreatorMenu />
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[240px_1fr] lg:px-8">
        {/* Sidebar Nav */}
        <aside className="hidden flex-col gap-1 md:flex">
          <p className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
            Navigation
          </p>
          <DashboardNavLink
            href="/dashboard"
            icon={<LayoutDashboard className="size-4" />}
            label="Overview"
          />
          <DashboardNavLink
            href="/dashboard/upload"
            icon={<Upload className="size-4" />}
            label="Upload a sound"
          />
          <DashboardNavLink
            href="/dashboard/uploads"
            icon={<Music className="size-4" />}
            label="Manage uploads"
          />
          <DashboardNavLink
            href="/dashboard/settings"
            icon={<Settings className="size-4" />}
            label="Account settings"
          />

          <div className="my-3 border-t border-border/60" />

          <p className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
            Community
          </p>
          <DashboardNavLink
            href="/"
            icon={<Compass className="size-4" />}
            label="Public library"
          />
        </aside>

        {/* Content Area */}
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  )
}

function DashboardNavLink({
  href,
  icon,
  label,
}: {
  href: string
  icon: React.ReactNode
  label: string
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-muted-foreground transition-all hover:bg-secondary hover:text-foreground active:scale-[0.99]"
    >
      <span className="text-muted-foreground">{icon}</span>
      <span>{label}</span>
    </Link>
  )
}
