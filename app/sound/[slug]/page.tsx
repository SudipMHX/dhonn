import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowUpRight,
  AudioLines,
  Clock3,
  Disc3,
  Heart,
  Headphones,
  Play,
  ShieldAlert,
  Sparkles,
  Volume2,
} from "lucide-react"

import { SoundDetailControls } from "@/components/sound-detail-controls"
import { SoundTile, type SoundCardData } from "@/components/sound-tile"
import { getPublicSound, getRelatedSounds } from "@/lib/services/sounds"

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const sound = await getPublicSound(slug)

  if (!sound) {
    return {
      title: "Sound not found",
      robots: { index: false, follow: false },
    }
  }

  const canonical = `/sound/${encodeURIComponent(sound.slug)}`

  return {
    title: sound.title,
    description: sound.description,
    alternates: { canonical },
    openGraph: {
      title: sound.title,
      description: sound.description,
      url: canonical,
      type: "music.song",
    },
  }
}

function formatDuration(seconds: number) {
  const total = Math.max(0, Math.floor(seconds))
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`
}

function serialize<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

export default async function SoundDetailPage({ params }: PageProps) {
  const { slug } = await params
  const sound = await getPublicSound(slug)

  if (!sound) notFound()

  const related = serialize(
    await getRelatedSounds(sound._id, sound.category._id)
  )

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "AudioObject",
    name: sound.title,
    description: sound.description,
    duration: `PT${Math.floor(sound.audio.durationSeconds)}S`,
    contentUrl: `${process.env.APP_URL ?? "http://localhost:3000"}/api/sounds/${encodeURIComponent(sound.slug)}/audio`,
  }

  const stats = [
    {
      label: "Total Plays",
      value: sound.plays.toLocaleString(),
      icon: Play,
    },
    {
      label: "Favorites",
      value: sound.favorites.toLocaleString(),
      icon: Heart,
    },
    {
      label: "Duration",
      value: formatDuration(sound.audio.durationSeconds),
      icon: Clock3,
    },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex min-w-0 items-center gap-2 overflow-hidden text-xs font-medium text-muted-foreground sm:mb-8"
        >
          <Link
            href="/"
            className="shrink-0 transition-colors hover:text-foreground"
          >
            Home
          </Link>

          <span className="text-border">/</span>

          <Link
            href={`/category/${encodeURIComponent(sound.category.slug)}`}
            className="min-w-0 truncate transition-colors hover:text-foreground"
          >
            {sound.categoryName}
          </Link>

          <span className="text-border">/</span>

          <span
            aria-current="page"
            className="min-w-0 truncate font-semibold text-foreground"
          >
            {sound.title}
          </span>
        </nav>

        <article className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs">
          {/* Sound artwork hero banner */}
          <div className="relative isolate overflow-hidden bg-zinc-950 text-white">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-24 left-1/4 -z-10 size-80 rounded-full bg-indigo-600/30 blur-[90px]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-16 bottom-[-140px] -z-10 size-96 rounded-full bg-violet-600/25 blur-[100px]"
            />

            <div className="relative px-5 pt-5 pb-6 sm:px-8 sm:pt-7 sm:pb-8 lg:px-10">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Link
                  href={`/category/${encodeURIComponent(sound.category.slug)}`}
                  className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.08] px-3 py-1.5 text-xs font-medium text-white/90 backdrop-blur-md transition-colors hover:bg-white/[0.15]"
                >
                  <Disc3 className="size-3.5 shrink-0 text-indigo-300" />
                  <span className="truncate">{sound.categoryName}</span>
                  <ArrowUpRight className="size-3.5 shrink-0 text-white/60" />
                </Link>

                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.08] px-3 py-1.5 text-xs font-mono font-medium text-white/80 tabular-nums backdrop-blur-md">
                  <Clock3 className="size-3.5" />
                  {formatDuration(sound.audio.durationSeconds)}
                </span>
              </div>

              {/* Decorative waveform */}
              <div className="flex h-32 items-center justify-center gap-[3px] overflow-hidden py-4 sm:h-40 sm:gap-1">
                {Array.from({ length: 64 }, (_, index) => {
                  const height = 14 + ((index * 37 + sound.plays) % 74)

                  return (
                    <span
                      key={index}
                      className={`w-1 shrink-0 rounded-full sm:w-[5px] ${
                        index % 6 === 0
                          ? "bg-indigo-300"
                          : "bg-gradient-to-t from-indigo-500/60 via-indigo-400 to-violet-300"
                      }`}
                      style={{
                        height: `${height}%`,
                        opacity: 0.4 + (height / 100) * 0.6,
                      }}
                    />
                  )
                })}
              </div>

              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold tracking-wider text-indigo-300 uppercase">
                    <Sparkles className="size-3.5" />
                    <span>dhonn original sound</span>
                  </div>
                  <p className="text-xs text-white/60">
                    High-quality audio snippet ready to play or download.
                  </p>
                </div>

                <div className="hidden items-center gap-2 text-xs font-medium text-white/40 sm:flex">
                  <AudioLines className="size-4" />
                  <span>COMMUNITY AUDIO</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sound information */}
          <div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10">
            <section className="min-w-0">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200/60 bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300">
                  <Volume2 className="size-3.5" />
                  Sound
                </span>

                <span className="text-xs text-muted-foreground">
                  By {sound.owner?.name ?? "dhonn creator"}
                </span>
              </div>

              <h1 className="text-2xl leading-tight font-bold tracking-tight text-foreground break-words sm:text-3xl lg:text-4xl">
                {sound.title}
              </h1>

              {sound.description && (
                <p className="mt-3 text-sm leading-relaxed whitespace-pre-line text-muted-foreground sm:text-base">
                  {sound.description}
                </p>
              )}

              {/* Playback & action controls */}
              <SoundDetailControls
                id={sound._id.toString()}
                slug={sound.slug}
                title={sound.title}
              />

              {/* Tags */}
              {sound.tags.length > 0 && (
                <div className="mt-8 border-t border-border/60 pt-6">
                  <h2 className="mb-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    Related Tags
                  </h2>

                  <div className="flex flex-wrap gap-2">
                    {sound.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="rounded-lg border border-border/70 bg-secondary/60 px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-indigo-300 hover:text-indigo-600 dark:hover:border-indigo-800 dark:hover:text-indigo-400"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick stats */}
              <div className="mt-8 grid grid-cols-3 gap-3">
                {stats.map(({ label, value, icon: Icon }) => (
                  <div
                    key={label}
                    className="min-w-0 rounded-xl border border-border/70 bg-secondary/40 p-4"
                  >
                    <Icon className="mb-2.5 size-4 text-indigo-600 dark:text-indigo-400" />
                    <p className="truncate text-lg font-bold tracking-tight text-foreground tabular-nums sm:text-xl">
                      {value}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Details sidebar */}
            <aside className="h-fit rounded-xl border border-border/80 bg-secondary/30 p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
                  <Headphones className="size-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-foreground">
                    Sound Info
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Metadata &amp; license
                  </p>
                </div>
              </div>

              <dl className="mt-5 divide-y divide-border/60 text-xs">
                <div className="flex items-start justify-between gap-3 py-3 first:pt-0">
                  <dt className="text-muted-foreground">Creator</dt>
                  <dd className="max-w-[60%] text-right font-medium text-foreground break-words">
                    {sound.owner?.name ?? "dhonn creator"}
                  </dd>
                </div>

                <div className="flex items-start justify-between gap-3 py-3">
                  <dt className="text-muted-foreground">Category</dt>
                  <dd className="max-w-[60%] text-right font-medium text-foreground break-words">
                    {sound.categoryName}
                  </dd>
                </div>

                <div className="flex items-center justify-between gap-3 py-3">
                  <dt className="text-muted-foreground">Total Plays</dt>
                  <dd className="font-semibold text-foreground tabular-nums">
                    {sound.plays.toLocaleString()}
                  </dd>
                </div>

                <div className="flex items-center justify-between gap-3 py-3 last:pb-0">
                  <dt className="text-muted-foreground">Favorites</dt>
                  <dd className="font-semibold text-foreground tabular-nums">
                    {sound.favorites.toLocaleString()}
                  </dd>
                </div>
              </dl>

              <div className="mt-6 border-t border-border/60 pt-4">
                <Link
                  href={`/report?sound=${encodeURIComponent(sound._id.toString())}`}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border/70 bg-card px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 dark:hover:border-rose-900/60 dark:hover:bg-rose-950/30 dark:hover:text-rose-400"
                >
                  <ShieldAlert className="size-3.5" />
                  <span>Report content or copyright</span>
                </Link>
              </div>
            </aside>
          </div>
        </article>

        {/* Related sounds */}
        {related.length > 0 && (
          <section className="mt-14 sm:mt-16">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold tracking-wider text-indigo-600 uppercase dark:text-indigo-400">
                  <Sparkles className="size-3.5" />
                  <span>Discover More</span>
                </div>
                <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                  More in {sound.categoryName}
                </h2>
              </div>

              <Link
                href={`/category/${encodeURIComponent(sound.category.slug)}`}
                className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400"
              >
                <span>View all</span>
                <ArrowUpRight className="size-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {related.map((item, index) => (
                <SoundTile
                  key={item._id}
                  sound={item as SoundCardData}
                  index={index}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
    </div>
  )
}
