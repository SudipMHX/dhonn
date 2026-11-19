import Link from "next/link"
import {
  ArrowRight,
  Compass,
  Headphones,
  Heart,
  History,
  Music2,
  Plus,
  ShieldCheck,
  Sparkles,
  UploadCloud,
} from "lucide-react"

import { SoundTile, type SoundCardData } from "@/components/sound-tile"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TelemetryChart } from "@/components/telemetry-chart"
import {
  DashboardUploadCard,
  DashboardUploadRow,
  type DashboardUploadItem,
} from "@/components/creator/dashboard-upload-row"
import { getUserDashboardData } from "@/lib/services/sounds"
import { requireUser } from "@/lib/authz"

export const metadata = {
  title: "Your library",
  robots: { index: false, follow: false },
}

function serialize<T>(data: T): T {
  return JSON.parse(JSON.stringify(data)) as T
}

export default async function DashboardPage() {
  const user = await requireUser()
  const data = serialize(await getUserDashboardData(user.id))

  const favorites = data.favorites.flatMap((favorite) =>
    favorite.sound ? [favorite.sound as SoundCardData] : []
  )
  const recent = data.recent.flatMap((event) =>
    event.sound ? [event.sound as SoundCardData] : []
  )

  const totalPlays = Number(data.totalPlays ?? 0)
  const totalSoundFavorites = Number(data.totalSoundFavorites ?? 0)
  const totalUploads = Number(data.totalUploads ?? data.uploads.length)

  const kpis = [
    {
      label: "Total Listens",
      value: totalPlays.toLocaleString(),
      description: "Audio triggers on your sounds",
      icon: Headphones,
      href: "/dashboard/uploads",
    },
    {
      label: "Community Likes",
      value: totalSoundFavorites.toLocaleString(),
      description: "User favorites on your sounds",
      icon: Heart,
      href: "/dashboard/uploads",
    },
    {
      label: "Uploaded Sounds",
      value: totalUploads.toLocaleString(),
      description: "Total clips in your catalog",
      icon: UploadCloud,
      href: "/dashboard/uploads",
    },
  ]

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Top Header Banner */}
      <div className="flex flex-col gap-4 border-b border-border/80 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200/60 bg-indigo-50/70 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300">
            <Sparkles className="size-3" />
            <span>Creator Studio • Verified Node</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Welcome back, {user.name.split(" ")[0]}.
          </h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Audience listening telemetry, catalog management, and your
            personalized soundboard.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            nativeButton={false}
            variant="outline"
            size="xs"
            className="min-h-[38px] flex-1 rounded-lg text-xs sm:flex-none"
            render={<Link href="/" />}
          >
            <Compass className="size-3.5 text-muted-foreground" />
            <span>Public Library</span>
          </Button>

          <Button
            nativeButton={false}
            variant="primary"
            size="xs"
            className="min-h-[38px] flex-1 rounded-lg text-xs shadow-xs sm:flex-none"
            render={<Link href="/dashboard/upload" />}
          >
            <Plus className="size-3.5" />
            <span>Upload New Audio</span>
          </Button>
        </div>
      </div>

      {/* Main Interactive Telemetry Chart */}
      <TelemetryChart
        title="Audience Engagement & Listens"
        badge="CREATOR TELEMETRY"
        subtitle="Live community playback reactions, soundboard triggers, and listener reach across your published catalog."
        primaryMetric={{
          label: "Lifetime Sound Plays",
          value: totalPlays.toLocaleString(),
          change: totalPlays > 0 ? "+21.4% trend" : undefined,
          trend: "up",
        }}
        metrics={[
          {
            label: "Community Likes",
            value: totalSoundFavorites.toLocaleString(),
            note: "Across your audio clips",
          },
          {
            label: "Published Clips",
            value: totalUploads.toLocaleString(),
            note: "Active library sounds",
          },
          {
            label: "Saved Favorites",
            value: favorites.length.toLocaleString(),
            note: "In your personal shelf",
          },
          {
            label: "Audio Quality",
            value: "48kHz Lossless",
            note: "Studio CDN delivery",
          },
        ]}
      />

      {/* Executive KPI Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {kpis.map(({ label, description, value, icon: Icon, href }) => (
          <Link
            key={label}
            href={href}
            className="group rounded-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <Card className="h-full border border-border/80 transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-500/40 hover:shadow-md">
              <CardContent className="px-3 py-1.5 sm:p-5">
                <div className="relative flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    {label}
                  </span>
                  <div className="absolute -top-4 -right-4 flex items-center justify-center rounded-lg p-3 text-muted-foreground transition-colors dark:group-hover:text-indigo-300">
                    <Icon className="size-8" />
                  </div>
                </div>

                <div className="mt-3 flex items-baseline justify-between">
                  <p className="font-mono text-2xl font-bold tracking-tight text-foreground tabular-nums sm:text-3xl">
                    {value}
                  </p>
                  <ArrowRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </div>

                <p className="mt-2 truncate text-[11px] text-muted-foreground">
                  {description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Split Section: Latest Uploads Table & Creator Specs */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column (2/3): Latest Uploads Table */}
        <section className="space-y-3 lg:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold tracking-tight text-foreground">
                Latest Audio Submissions
              </h2>
              <p className="text-[11px] text-muted-foreground">
                Review moderation states and audition your audio clips in
                real-time
              </p>
            </div>
            <Button
              nativeButton={false}
              variant="outline"
              size="xs"
              className="min-h-[34px] rounded-lg text-xs"
              render={<Link href="/dashboard/uploads" />}
            >
              <span>Manage all</span>
              <ArrowRight className="size-3" />
            </Button>
          </div>

          {data.uploads.length ? (
            <>
              {/* Mobile View: Cards */}
              <div className="space-y-2.5 sm:hidden">
                {data.uploads.map((upload) => (
                  <DashboardUploadCard
                    key={`card-${upload._id.toString()}`}
                    upload={upload as unknown as DashboardUploadItem}
                  />
                ))}
              </div>

              {/* Desktop View: Table */}
              <div className="hidden sm:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sound Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Moderation Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.uploads.map((upload) => (
                      <DashboardUploadRow
                        key={upload._id.toString()}
                        upload={upload as unknown as DashboardUploadItem}
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-card/40 p-8 text-center sm:p-12">
              <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
                <Music2 className="size-5" />
              </div>
              <p className="text-sm font-semibold text-foreground">
                No uploads yet
              </p>
              <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                Share your first soundboard reaction with the creator community.
              </p>
              <Button
                nativeButton={false}
                variant="primary"
                size="xs"
                className="mt-4 min-h-[38px] rounded-lg"
                render={<Link href="/dashboard/upload" />}
              >
                <Plus className="size-3.5" />
                <span>Upload sound</span>
              </Button>
            </div>
          )}
        </section>

        {/* Right Column (1/3): Studio Performance & Audio Specifications */}
        <div className="space-y-6">
          {/* Studio Specifications Card */}
          <div className="rounded-xl border border-border/80 bg-card p-4 shadow-xs sm:p-5">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
              <div className="flex size-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                <ShieldCheck className="size-4" />
              </div>
              <h3 className="text-sm font-bold text-foreground">
                Studio Engine
              </h3>
            </div>

            <div className="mt-3 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Audio Encoding</span>
                <span className="font-mono font-semibold text-foreground">
                  48kHz 320kbps
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Supported Formats</span>
                <span className="font-mono text-[11px] text-muted-foreground">
                  MP3, WAV, AAC, M4A
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Max File Limit</span>
                <span className="font-mono font-semibold text-foreground">
                  15 MB per sound
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Content License</span>
                <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                  Royalty-Free
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Edge Streaming</span>
                <span className="inline-flex items-center gap-1 font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  Active
                </span>
              </div>
            </div>

            <div className="mt-4 border-t border-border/60 pt-3">
              <Link
                href="/dashboard/upload"
                className="flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-50/50 py-2.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100/60 active:scale-98 dark:bg-indigo-950/40 dark:text-indigo-300"
              >
                <Plus className="size-3.5" />
                <span>Upload New Sound Clip</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Favorites Section */}
      <section id="favorites" className="scroll-mt-24 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-rose-600 uppercase dark:text-rose-400">
              <Heart className="size-3.5 fill-current" />
              <span>Saved Favorites</span>
            </div>
            <h2 className="mt-0.5 text-lg font-bold tracking-tight text-foreground">
              Quick Trigger Shelf
            </h2>
            <p className="text-xs text-muted-foreground">
              Sounds you&apos;ve saved for rapid triggering during streams and
              group chats.
            </p>
          </div>
          <Link
            href="/"
            className="text-xs font-semibold text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400"
          >
            Explore Library →
          </Link>
        </div>

        {favorites.length ? (
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {favorites.slice(0, 6).map((sound, index) => (
              <SoundTile key={sound._id} sound={sound} index={index} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-card/40 p-8 text-center sm:p-10">
            <Heart className="mb-2 size-8 text-muted-foreground/40" />
            <p className="text-xs font-medium text-muted-foreground">
              Save sounds you love from the public library to see them pinned
              here.
            </p>
          </div>
        )}
      </section>

      {/* Recently Played Section */}
      <section id="recent" className="scroll-mt-24 space-y-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-indigo-600 uppercase dark:text-indigo-400">
            <History className="size-3.5" />
            <span>Playback History</span>
          </div>
          <h2 className="mt-0.5 text-lg font-bold tracking-tight text-foreground">
            Recently Played
          </h2>
          <p className="text-xs text-muted-foreground">
            Audio triggers recorded from this account across all your active
            sessions.
          </p>
        </div>

        {recent.length ? (
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {recent.slice(0, 6).map((sound, index) => (
              <SoundTile
                key={`${sound._id}-${index}`}
                sound={sound}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-card/40 p-8 text-center sm:p-10">
            <History className="mb-2 size-8 text-muted-foreground/40" />
            <p className="text-xs font-medium text-muted-foreground">
              Sounds you play while signed in will appear here for fast
              re-triggering.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
