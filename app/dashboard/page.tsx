import Link from "next/link"

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
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">Your creator space</p>
          <h1 className="mt-1 text-3xl font-black">
            Hey, {user.name.split(" ")[0]}.
          </h1>
        </div>
        <Button nativeButton={false} render={<Link href="/dashboard/upload" />}>
          Upload a sound
        </Button>
      </div>
      <section className="mt-9">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">Recent uploads</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Showing your 5 latest uploads.
            </p>
          </div>
          <Button
            nativeButton={false}
            variant="outline"
            render={<Link href="/dashboard/uploads" />}
          >
            Manage uploads
          </Button>
        </div>
        <div className="overflow-x-auto rounded-2xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sound</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.uploads.length ? (
                data.uploads.map((upload) => (
                  <TableRow key={upload._id.toString()}>
                    <TableCell className="font-medium">
                      {upload.title}
                    </TableCell>
                    <TableCell>{upload.categoryName}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          upload.status === "published"
                            ? "default"
                            : upload.status === "rejected"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {upload.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="py-8 text-center text-muted-foreground"
                  >
                    You haven’t uploaded any sounds yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </section>
      <section className="mt-9">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Favorites</h2>
          <Link href="/" className="text-sm text-sky-600">
            Discover more
          </Link>
        </div>
        {favorites.length ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
            {favorites.slice(0, 6).map((sound, index) => (
              <SoundTile key={sound._id} sound={sound} index={index} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-700">
            Save sounds you love and they’ll show up here.
          </div>
        )}
      </section>
      <section className="mt-9">
        <h2 className="mb-4 text-xl font-bold">Recently played</h2>
        {recent.length ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
            {recent.slice(0, 3).map((sound, index) => (
              <SoundTile
                key={`${sound._id}-${index}`}
                sound={sound}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-700">
            Sounds you play while signed in will appear here.
          </div>
        )}
      </section>
    </div>
  )
}
