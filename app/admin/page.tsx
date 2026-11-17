import Link from "next/link"
import {
  AlertTriangle,
  ArrowRight,
  FolderTree,
  Headphones,
  Info,
  Music,
  UploadCloud,
  Users,
} from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import { getAdminOverview } from "@/lib/services/admin"

export const metadata = {
  title: "Admin overview",
  robots: { index: false, follow: false },
}

export default async function AdminPage() {
  const stats = await getAdminOverview()

  const cards = [
    {
      label: "Published Sounds",
      value: stats.sounds,
      href: "/admin/sounds",
      icon: Music,
      highlight: false,
    },
    {
      label: "Pending Uploads",
      value: stats.pendingUploads,
      href: "/admin/uploads",
      icon: UploadCloud,
      highlight: stats.pendingUploads > 0,
    },
    {
      label: "Open Reports",
      value: stats.reports,
      href: "/admin/reports",
      icon: AlertTriangle,
      highlight: stats.reports > 0,
    },
    {
      label: "Plays (24h)",
      value: stats.playsToday,
      href: "/admin/sounds",
      icon: Headphones,
      highlight: false,
    },
    {
      label: "Registered Users",
      value: stats.users,
      href: "/admin/users",
      icon: Users,
      highlight: false,
    },
    {
      label: "Categories",
      value: stats.categories,
      href: "/admin/categories",
      icon: FolderTree,
      highlight: false,
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-border/80 pb-6">
        <p className="text-xs font-semibold tracking-wider text-indigo-600 uppercase dark:text-indigo-400">
          Platform Operations
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Overview &amp; Metrics
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Real-time summary of moderation queues, audio catalog, and community activity.
        </p>
      </div>

      {/* Grid of stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(({ label, value, href, icon: Icon, highlight }) => (
          <Link
            href={href}
            prefetch={false}
            key={label}
            className="group rounded-2xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <Card className="h-full border-border/80 transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-500/40 hover:shadow-md">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    {label}
                  </span>
                  <div
                    className={`flex size-8 items-center justify-center rounded-xl transition-colors ${
                      highlight
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                        : "bg-secondary text-muted-foreground group-hover:bg-indigo-50 group-hover:text-indigo-600 dark:group-hover:bg-indigo-950/40 dark:group-hover:text-indigo-300"
                    }`}
                  >
                    <Icon className="size-4" />
                  </div>
                </div>

                <div className="mt-3 flex items-baseline justify-between">
                  <p className="text-2xl font-bold tracking-tight text-foreground tabular-nums sm:text-3xl">
                    {value.toLocaleString()}
                  </p>
                  <ArrowRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Alert variant="info" className="mt-8">
        <Info className="size-4" />
        <AlertDescription>
          Pending creator submissions must be audited for audio volume, duration, and copyright compliance before publication. Moderation actions are permanently recorded for compliance and audit logs.
        </AlertDescription>
      </Alert>
    </div>
  )
}
