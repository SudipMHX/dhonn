import Link from "next/link"
import { ArrowRight, Heart, History, Plus, UploadCloud } from "lucide-react"

import { SoundTile, type SoundCardData } from "@/components/sound-tile"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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

  const stats = [
    {
      label: "My Uploads",
      value: data.uploads.length,
      icon: UploadCloud,
      href: "/dashboard/uploads",
    },
    {
      label: "Favorites Saved",
      value: favorites.length,
      icon: Heart,
      href: "#favorites",
    },
    {
      label: "Recent Plays",
      value: recent.length,
      icon: History,
      href: "#recent",
    },
  ]

  return (
    <div className="space-y-10">
      {/* Header Bar */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-wider text-indigo-600 uppercase dark:text-indigo-400">
            Creator Studio
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Welcome back, {user.name.split(" ")[0]}.
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Manage your audio library, review uploads, and access your favorite sounds.
          </p>
        </div>

        <Button
          nativeButton={false}
          variant="primary"
          size="md"
          render={<Link href="/dashboard/upload" />}
        >
          <Plus className="size-4" />
          <span>Upload sound</span>
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, icon: Icon, href }) => (
          <Link
            key={label}
            href={href}
            className="group rounded-2xl border border-border/80 bg-card p-5 shadow-xs transition-all hover:border-indigo-500/40 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                {label}
              </span>
              <div className="flex size-8 items-center justify-center rounded-lg bg-secondary text-muted-foreground transition-colors group-hover:bg-indigo-50 group-hover:text-indigo-600 dark:group-hover:bg-indigo-950/40 dark:group-hover:text-indigo-300">
                <Icon className="size-4" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold tracking-tight text-foreground tabular-nums">
              {value}
            </p>
          </Link>
        ))}
      </div>

      {/* Recent Uploads Table */}
      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-foreground">Latest Uploads</h2>
            <p className="text-xs text-muted-foreground">
              Your 5 most recent audio submissions.
            </p>
          </div>
          <Button
            nativeButton={false}
            variant="outline"
            size="sm"
            render={<Link href="/dashboard/uploads" />}
          >
            <span>Manage All</span>
            <ArrowRight className="size-3.5" />
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sound Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Moderation Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.uploads.length ? (
              data.uploads.map((upload) => (
                <TableRow key={upload._id.toString()}>
                  <TableCell className="font-medium text-foreground">
                    {upload.title}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {upload.categoryName}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        upload.status === "published"
                          ? "success"
                          : upload.status === "rejected"
                            ? "destructive"
                            : "warning"
                      }
                    >
                      {upload.status === "published"
                        ? "Published"
                        : upload.status === "rejected"
                          ? "Rejected"
                          : "Pending Review"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="py-10 text-center text-xs text-muted-foreground"
                >
                  You haven&apos;t uploaded any sounds yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </section>

      {/* Favorites Section */}
      <section id="favorites" className="scroll-mt-24">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">Saved Favorites</h2>
            <p className="text-xs text-muted-foreground">
              Sounds you&apos;ve favorited for quick access.
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
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
            {favorites.slice(0, 5).map((sound, index) => (
              <SoundTile key={sound._id} sound={sound} index={index} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border/80 bg-card/40 p-8 text-center text-xs text-muted-foreground">
            Save sounds you love and they will appear here.
          </div>
        )}
      </section>

      {/* Recently Played Section */}
      <section id="recent" className="scroll-mt-24">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-foreground">Recently Played</h2>
          <p className="text-xs text-muted-foreground">
            Audio triggers from this account across devices.
          </p>
        </div>

        {recent.length ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
            {recent.slice(0, 5).map((sound, index) => (
              <SoundTile
                key={`${sound._id}-${index}`}
                sound={sound}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border/80 bg-card/40 p-8 text-center text-xs text-muted-foreground">
            Sounds you play while signed in will appear here.
          </div>
        )}
      </section>
    </div>
  )
}
