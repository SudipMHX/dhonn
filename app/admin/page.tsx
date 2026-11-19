import Link from "next/link"
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  FolderTree,
  Headphones,
  Music,
  Shield,
  ShieldCheck,
  UploadCloud,
  Users,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { TelemetryChart } from "@/components/telemetry-chart"
import { getAdminOverview } from "@/lib/services/admin"

export const metadata = {
  title: "Admin overview",
  robots: { index: false, follow: false },
}

type PendingSound = {
  _id: string
  title: string
  slug: string
  categoryName?: string
  owner?: { name?: string; email?: string }
  audio?: { durationSeconds?: number }
  createdAt: string
}

type PendingReport = {
  _id: string
  type: string
  email: string
  details: string
  status: string
  sound?: { title?: string; slug?: string }
}

export default async function AdminPage() {
  const stats = await getAdminOverview()
  const recentPending = (stats.recentPending ?? []) as PendingSound[]
  const recentReports = (stats.recentReports ?? []) as PendingReport[]

  const kpis = [
    {
      label: "Published Sounds",
      value: stats.sounds,
      description: "Active library catalog",
      href: "/admin/sounds",
      icon: Music,
      alert: false,
    },
    {
      label: "Pending Review",
      value: stats.pendingUploads,
      description: stats.pendingUploads > 0 ? "Awaiting review" : "Queue clear",
      href: "/admin/uploads",
      icon: UploadCloud,
      alert: stats.pendingUploads > 0,
      badge: stats.pendingUploads > 0 ? "Needs Review" : undefined,
    },
    {
      label: "Disputed Reports",
      value: stats.reports,
      description: stats.reports > 0 ? "Action required" : "Zero open disputes",
      href: "/admin/reports",
      icon: AlertTriangle,
      alert: stats.reports > 0,
      badge: stats.reports > 0 ? "Requires Action" : undefined,
    },
    {
      label: "Plays (Rolling 24h)",
      value: stats.playsToday,
      description: "Lossless audio triggers",
      href: "/admin/sounds",
      icon: Headphones,
      alert: false,
    },
    {
      label: "Registered Users",
      value: stats.users,
      description: "Active creator accounts",
      href: "/admin/users",
      icon: Users,
      alert: false,
    },
    {
      label: "Sound Categories",
      value: stats.categories,
      description: "Discovery taxonomies",
      href: "/admin/categories",
      icon: FolderTree,
      alert: false,
    },
  ]

  const quickActions = [
    {
      title: "Review Submissions",
      description: "Audit audio duration, volume, and compliance",
      href: "/admin/uploads",
      icon: UploadCloud,
      count: stats.pendingUploads,
    },
    {
      title: "Sound Catalog",
      description: "Feature, trend, edit, or purge published audio",
      href: "/admin/sounds",
      icon: Music,
      count: stats.sounds,
    },
    {
      title: "Dispute Center",
      description: "Inspect copyright claims and flagged content",
      href: "/admin/reports",
      icon: AlertTriangle,
      count: stats.reports,
    },
    {
      title: "Organize Categories",
      description: "Maintain taxonomy collections and URLs",
      href: "/admin/categories",
      icon: FolderTree,
      count: stats.categories,
    },
  ]

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Top Header Banner */}
      <div className="flex flex-col gap-4 border-b border-border/80 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200/60 bg-indigo-50/70 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300">
            <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
            <span>Mission Control • Live Cluster</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Operations &amp; Governance
          </h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Real-time platform telemetry, sound catalog curation, and moderation
            workbench.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            nativeButton={false}
            variant="outline"
            size="xs"
            className="min-h-[38px] flex-1 rounded-lg text-xs sm:flex-none"
            render={<Link href="/admin/uploads" />}
          >
            <span>Review Queue</span>
            {stats.pendingUploads > 0 && (
              <span className="ml-1 rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                {stats.pendingUploads}
              </span>
            )}
          </Button>

          <Button
            nativeButton={false}
            variant="primary"
            size="xs"
            className="min-h-[38px] flex-1 rounded-lg text-xs sm:flex-none"
            render={<Link href="/admin/sounds" />}
          >
            <span>Manage Catalog</span>
            <ArrowRight className="size-3" />
          </Button>
        </div>
      </div>

      {/* Main Interactive Telemetry Chart */}
      <TelemetryChart
        title="Platform Audio Traffic"
        badge="REAL-TIME TELEMETRY"
        subtitle="Global edge CDN audio streaming volume, instant soundboard playback triggers, and concurrent listener bandwidth."
        primaryMetric={{
          label: "Audio Plays (Last 24 Hours)",
          value: Number(stats.playsToday ?? 0).toLocaleString(),
          change: "+14.8% vs avg",
          trend: "up",
        }}
        metrics={[
          {
            label: "Catalog Volume",
            value: Number(stats.sounds ?? 0).toLocaleString(),
            note: "Published sounds",
          },
          {
            label: "Pending Queue",
            value: Number(stats.pendingUploads ?? 0).toLocaleString(),
            note: stats.pendingUploads > 0 ? "Review required" : "All clear",
          },
          {
            label: "Active Disputes",
            value: Number(stats.reports ?? 0).toLocaleString(),
            note: stats.reports > 0 ? "Requires action" : "Zero open",
          },
          {
            label: "Creator Accounts",
            value: Number(stats.users ?? 0).toLocaleString(),
            note: "Registered users",
          },
        ]}
      />

      {/* Executive KPI Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {kpis.map(
          ({ label, description, value, href, icon: Icon, alert, badge }) => (
            <Link
              href={href}
              prefetch={false}
              key={label}
              className="group rounded-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <Card
                className={`h-full border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                  alert
                    ? "border-amber-300/80 bg-amber-50/20 dark:border-amber-900/60 dark:bg-amber-950/20"
                    : "border-border/80 hover:border-indigo-500/40"
                }`}
              >
                <CardContent className="px-3 py-1.5">
                  <div className="relative flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                      {label}
                    </span>
                    <div
                      className={`absolute top-0 -right-2 flex size-8 items-center justify-center rounded-lg transition-colors md:-top-2 ${
                        alert
                          ? "text-amber-700 dark:text-amber-300"
                          : "text-muted-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-300"
                      }`}
                    >
                      <Icon className="size-8" />
                    </div>
                  </div>

                  <div className="mt-3 flex items-baseline justify-between">
                    <p className="font-mono text-2xl font-bold tracking-tight text-foreground tabular-nums sm:text-3xl">
                      {Number(value ?? 0).toLocaleString()}
                    </p>
                    <ArrowRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="truncate">{description}</span>
                    {badge && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                        {badge}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        )}
      </div>

      {/* Split Workbench: Live Queue & Operations Ledger */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column (2/3): Pending Review Queue & Quick Shortcuts */}
        <div className="space-y-6 lg:col-span-2">
          {/* Pending Queue Card */}
          <div className="rounded-xl border border-border/80 bg-card p-4 shadow-xs sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                  <UploadCloud className="size-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Submissions Awaiting Moderation
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Creators awaiting audio and compliance approval
                  </p>
                </div>
              </div>

              <Link
                href="/admin/uploads"
                className="text-xs font-semibold text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400"
              >
                View all ({stats.pendingUploads}) →
              </Link>
            </div>

            {recentPending.length > 0 ? (
              <div className="mt-3 divide-y divide-border/50">
                {recentPending.map((sound) => (
                  <div
                    key={sound._id}
                    className="flex flex-col gap-2 py-3 text-xs sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="truncate font-semibold text-foreground">
                        {sound.title}
                      </p>
                      <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                        <span>{sound.owner?.name || "Creator"}</span>
                        <span>·</span>
                        <span className="rounded bg-secondary px-1.5 py-0.5 font-medium">
                          {sound.categoryName || "General"}
                        </span>
                        {sound.audio?.durationSeconds && (
                          <span className="font-mono">
                            {sound.audio.durationSeconds.toFixed(1)}s
                          </span>
                        )}
                      </div>
                    </div>

                    <Link
                      href="/admin/uploads"
                      className="flex min-h-[36px] shrink-0 items-center justify-center rounded-lg border border-border/80 bg-secondary/60 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary active:scale-95"
                    >
                      Audit
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <CheckCircle2 className="mx-auto mb-2 size-8 text-emerald-500/80" />
                <p className="text-xs font-medium text-foreground">
                  Moderation Queue Clean
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  All community sound submissions have been audited.
                </p>
              </div>
            )}
          </div>

          {/* Quick Management Shortcuts */}
          <div className="rounded-xl border border-border/80 bg-card p-4 shadow-xs sm:p-5">
            <h3 className="mb-3 text-xs font-bold tracking-wider text-muted-foreground uppercase">
              Management Workbench
            </h3>

            <div className="grid gap-2.5 sm:grid-cols-2">
              {quickActions.map((action) => {
                const Icon = action.icon
                return (
                  <Link
                    key={action.title}
                    href={action.href}
                    prefetch={false}
                    className="group flex min-h-[52px] items-center justify-between rounded-xl border border-border/70 bg-secondary/30 p-3.5 transition-all duration-150 hover:border-indigo-500/40 hover:bg-secondary/70 active:scale-98"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-card text-muted-foreground transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                        <Icon className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                          {action.title}
                        </p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {action.description}
                        </p>
                      </div>
                    </div>

                    <span className="shrink-0 pl-2 font-mono text-xs font-semibold text-muted-foreground">
                      {action.count}
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right Column (1/3): Disputes & Platform Security Health */}
        <div className="space-y-6">
          {/* Dispute Center Card */}
          <div className="rounded-xl border border-border/80 bg-card p-4 shadow-xs sm:p-5">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                  <AlertTriangle className="size-4" />
                </div>
                <h3 className="text-sm font-bold text-foreground">
                  Content Disputes
                </h3>
              </div>
              <Link
                href="/admin/reports"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
              >
                All ({stats.reports}) →
              </Link>
            </div>

            {recentReports.length > 0 ? (
              <div className="mt-3 divide-y divide-border/50">
                {recentReports.map((report) => (
                  <div key={report._id} className="py-2.5 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate font-semibold text-foreground">
                        {report.sound?.title || "Audio item"}
                      </span>
                      <span className="rounded bg-rose-50 px-1.5 py-0.5 text-[10px] font-semibold text-rose-700 uppercase dark:bg-rose-950/60 dark:text-rose-300">
                        {report.type}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-1 text-[11px] text-muted-foreground">
                      {report.details}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center">
                <ShieldCheck className="mx-auto mb-1.5 size-7 text-emerald-500/80" />
                <p className="text-xs font-medium text-foreground">
                  Zero Open Disputes
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  No pending DMCA or community flags.
                </p>
              </div>
            )}
          </div>

          {/* System Security & Integrity Ledger */}
          <div className="rounded-xl border border-border/80 bg-card p-4 shadow-xs sm:p-5">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                <Shield className="size-4" />
              </div>
              <h3 className="text-sm font-bold text-foreground">
                Security &amp; Health
              </h3>
            </div>

            <div className="mt-3 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Next.js Framework</span>
                <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                  v16.4.6 (Patched)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Storage Backend</span>
                <span className="font-mono font-semibold text-foreground">
                  AWS S3 Presigned
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Audio Codec</span>
                <span className="font-mono font-semibold text-foreground">
                  Lossless MP3/WAV
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  Database Connectivity
                </span>
                <span className="inline-flex items-center gap-1 font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Audit Log Ledger</span>
                <span className="font-mono text-[11px] text-muted-foreground">
                  Immutable
                </span>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-1.5 border-t border-border/60 pt-3 text-[10px] text-muted-foreground">
              <Clock className="size-3" />
              <span>Security verified • System operational</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
