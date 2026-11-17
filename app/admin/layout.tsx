import Link from "next/link"
import {
  AlertTriangle,
  ArrowRight,
  FolderTree,
  LayoutDashboard,
  Music,
  Shield,
  UploadCloud,
  Users,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { AdminMenu } from "@/components/admin/admin-menu"
import { requireAdmin } from "@/lib/authz"

export const dynamic = "force-dynamic"

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const admin = await requireAdmin()

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Admin Topbar */}
      <div className="border-b border-border/80 bg-card/60 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/admin"
              prefetch={false}
              className="flex items-center gap-2 font-heading text-sm font-bold tracking-tight text-foreground"
            >
              <div className="flex size-6 items-center justify-center rounded-lg bg-indigo-600 text-white">
                <Shield className="size-3.5" />
              </div>
              <span>Admin Console</span>
            </Link>

            <span className="hidden truncate rounded-full border border-border/60 bg-secondary/50 px-2.5 py-0.5 text-[11px] font-mono text-muted-foreground sm:inline-block">
              {admin.email}
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-3 text-xs">
            <Button
              nativeButton={false}
              variant="outline"
              size="xs"
              className="hidden sm:inline-flex"
              render={<Link href="/dashboard" />}
            >
              <span>Creator dashboard</span>
              <ArrowRight className="size-3" />
            </Button>

            <AdminMenu />
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[240px_1fr] lg:px-8">
        {/* Admin Navigation Sidebar */}
        <aside className="hidden flex-col gap-1 lg:flex">
          <p className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
            Administration
          </p>
          <AdminNavLink
            href="/admin"
            icon={<LayoutDashboard className="size-4" />}
            label="Overview"
          />
          <AdminNavLink
            href="/admin/uploads"
            icon={<UploadCloud className="size-4" />}
            label="Review uploads"
          />
          <AdminNavLink
            href="/admin/sounds"
            icon={<Music className="size-4" />}
            label="Manage sounds"
          />
          <AdminNavLink
            href="/admin/reports"
            icon={<AlertTriangle className="size-4" />}
            label="Content reports"
          />
          <AdminNavLink
            href="/admin/categories"
            icon={<FolderTree className="size-4" />}
            label="Categories"
          />
          <AdminNavLink
            href="/admin/users"
            icon={<Users className="size-4" />}
            label="User accounts"
          />
        </aside>

        <main className="min-w-0">{children}</main>
      </div>
    </div>
  )
}

function AdminNavLink({
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
      prefetch={false}
      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-muted-foreground transition-all hover:bg-secondary hover:text-foreground active:scale-[0.99]"
    >
      <span className="text-muted-foreground">{icon}</span>
      <span>{label}</span>
    </Link>
  )
}
