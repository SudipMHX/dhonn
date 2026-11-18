import { notFound } from "next/navigation"
import { ExternalLink, Volume2 } from "lucide-react"

import { getPublicSound } from "@/lib/services/sounds"

export const metadata = { robots: { index: false, follow: false } }

export default async function EmbedSoundPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const sound = await getPublicSound(slug)
  if (!sound) notFound()

  return (
    <main className="grid min-h-screen place-items-center bg-background p-3 text-foreground">
      <div className="w-full max-w-md rounded-2xl border border-border/80 bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex size-6 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <Volume2 className="size-3.5" />
            </div>
            <span className="font-heading text-xs font-bold tracking-tight text-foreground">
              dhonn.
            </span>
          </div>
          <span className="rounded-md bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            {sound.categoryName}
          </span>
        </div>

        <h1
          className="mt-2.5 truncate text-sm font-bold text-foreground"
          title={sound.title}
        >
          {sound.title}
        </h1>

        <audio
          controls
          preload="none"
          src={`/api/sounds/${encodeURIComponent(sound.slug)}/audio`}
          className="mt-3 h-8 w-full"
        />

        <div className="mt-2.5 flex items-center justify-between border-t border-border/50 pt-2 text-[11px] text-muted-foreground">
          <span>{Number(sound.plays ?? 0).toLocaleString()} plays</span>
          <a
            href={`/sound/${encodeURIComponent(sound.slug)}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 font-medium text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400"
          >
            <span>Open on dhonn</span>
            <ExternalLink className="size-3" />
          </a>
        </div>
      </div>
    </main>
  )
}
