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
      label: "Plays",
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
    <div className="min-h-screen bg-slate-50/80 text-slate-950 dark:bg-slate-950 dark:text-white">
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex min-w-0 items-center gap-2 overflow-hidden text-sm sm:mb-8"
        >
          <Link
            href="/"
            className="shrink-0 text-slate-500 transition-colors hover:text-violet-600 dark:hover:text-violet-400"
          >
            Home
          </Link>

          <span className="text-slate-300 dark:text-slate-700">/</span>

          <Link
            href={`/category/${encodeURIComponent(sound.category.slug)}`}
            className="min-w-0 truncate text-slate-500 transition-colors hover:text-violet-600 dark:hover:text-violet-400"
          >
            {sound.categoryName}
          </Link>

          <span className="text-slate-300 dark:text-slate-700">/</span>

          <span
            aria-current="page"
            className="min-w-0 truncate font-medium text-slate-900 dark:text-white"
          >
            {sound.title}
          </span>
        </nav>

        <article className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/40 dark:border-white/10 dark:bg-slate-900 dark:shadow-black/10">
          {/* Sound artwork */}
          <div className="relative isolate overflow-hidden bg-[#100d20]">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-32 left-1/4 -z-10 size-96 rounded-full bg-violet-600/30 blur-[100px]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-20 bottom-[-180px] -z-10 size-[28rem] rounded-full bg-fuchsia-500/20 blur-[110px]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute bottom-0 -left-24 -z-10 size-80 rounded-full bg-sky-500/15 blur-[100px]"
            />

            <div className="relative px-5 pt-5 pb-6 sm:px-9 sm:pt-8 sm:pb-8 lg:px-12 lg:pt-10">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Link
                  href={`/category/${encodeURIComponent(sound.category.slug)}`}
                  className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3.5 py-2 text-xs font-medium text-white/85 backdrop-blur-md transition-colors hover:bg-white/[0.12]"
                >
                  <Disc3 className="size-3.5 shrink-0 text-violet-300" />
                  <span className="truncate">{sound.categoryName}</span>
                  <ArrowUpRight className="size-3.5 shrink-0 text-white/50" />
                </Link>

                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.07] px-3 py-2 text-xs font-medium text-white/75 tabular-nums backdrop-blur-md">
                  <Clock3 className="size-3.5" />
                  {formatDuration(sound.audio.durationSeconds)}
                </span>
              </div>

              {/* Decorative waveform */}
              <div className="flex h-36 items-center justify-center gap-[3px] overflow-hidden py-5 sm:h-48 sm:gap-1">
                {Array.from({ length: 64 }, (_, index) => {
                  const height = 12 + ((index * 37 + sound.plays) % 76)

                  return (
                    <span
                      key={index}
                      className={`w-1 shrink-0 rounded-full sm:w-[5px] ${
                        index % 8 === 0
                          ? "bg-fuchsia-300/90"
                          : "bg-gradient-to-t from-violet-400/60 via-violet-300 to-sky-200"
                      }`}
                      style={{
                        height: `${height}%`,
                        opacity: 0.45 + (height / 100) * 0.55,
                      }}
                    />
                  )
                })}
              </div>

              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-violet-200/75 uppercase">
                    <Sparkles className="size-3.5" />
                    Sound spotlight
                  </div>
                  <p className="text-sm text-white/50">
                    Discover your next favorite sound.
                  </p>
                </div>

                <div className="hidden items-center gap-2 text-xs font-medium text-white/40 sm:flex">
                  <AudioLines className="size-4" />
                  <span>DHONN SOUND LIBRARY</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sound information */}
          <div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-12 lg:p-10">
            <section className="min-w-0">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 dark:bg-violet-400/10 dark:text-violet-300">
                  <Volume2 className="size-3.5" />
                  Audio sound
                </span>

                <span className="text-xs text-slate-400 dark:text-slate-500">
                  By {sound.owner?.name ?? "dhonn. creator"}
                </span>
              </div>

              <h1 className="max-w-3xl text-3xl leading-tight font-extrabold tracking-tight break-words sm:text-4xl lg:text-5xl">
                {sound.title}
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 whitespace-pre-line text-slate-600 sm:text-base sm:leading-8 dark:text-slate-300">
                {sound.description}
              </p>

              {/* Existing playback and favorite controls */}
              <div className="mt-7">
                <SoundDetailControls
                  id={sound._id.toString()}
                  slug={sound.slug}
                  title={sound.title}
                />
              </div>

              {/* Tags */}
              {sound.tags.length > 0 && (
                <div className="mt-8 border-t border-slate-100 pt-6 dark:border-white/[0.08]">
                  <h2 className="mb-3 text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                    Explore related tags
                  </h2>

                  <div className="flex flex-wrap gap-2">
                    {sound.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-violet-200 hover:text-violet-700 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300 dark:hover:border-violet-400/30 dark:hover:text-violet-300"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick stats */}
              <div className="mt-8 grid grid-cols-3 gap-2 sm:gap-3">
                {stats.map(({ label, value, icon: Icon }) => (
                  <div
                    key={label}
                    className="min-w-0 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3 sm:p-4 dark:border-white/[0.08] dark:bg-white/[0.025]"
                  >
                    <Icon className="mb-3 size-4 text-violet-500 dark:text-violet-400" />
                    <p className="truncate text-lg font-bold tracking-tight tabular-nums sm:text-xl">
                      {value}
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Details sidebar */}
            <aside className="h-fit rounded-2xl border border-slate-200/80 bg-slate-50/70 p-5 sm:p-6 dark:border-white/[0.08] dark:bg-white/[0.025]">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-400/10 dark:text-violet-300">
                  <Headphones className="size-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold">Sound details</h2>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    About this sound
                  </p>
                </div>
              </div>

              <dl className="mt-6 divide-y divide-slate-200/80 text-sm dark:divide-white/[0.08]">
                <div className="flex items-start justify-between gap-3 py-3 first:pt-0">
                  <dt className="text-slate-500 dark:text-slate-400">
                    Creator
                  </dt>
                  <dd className="max-w-[60%] text-right font-medium break-words">
                    {sound.owner?.name ?? "dhonn. creator"}
                  </dd>
                </div>

                <div className="flex items-start justify-between gap-3 py-3">
                  <dt className="text-slate-500 dark:text-slate-400">
                    Category
                  </dt>
                  <dd className="max-w-[60%] text-right font-medium break-words">
                    {sound.categoryName}
                  </dd>
                </div>

                <div className="flex items-center justify-between gap-3 py-3">
                  <dt className="text-slate-500 dark:text-slate-400">
                    Total plays
                  </dt>
                  <dd className="font-semibold tabular-nums">
                    {sound.plays.toLocaleString()}
                  </dd>
                </div>

                <div className="flex items-center justify-between gap-3 py-3 last:pb-0">
                  <dt className="text-slate-500 dark:text-slate-400">
                    Favorites
                  </dt>
                  <dd className="font-semibold tabular-nums">
                    {sound.favorites.toLocaleString()}
                  </dd>
                </div>
              </dl>

              <div className="mt-5 border-t border-slate-200/80 pt-4 dark:border-white/[0.08]">
                <Link
                  href={`/report?sound=${encodeURIComponent(sound._id.toString())}`}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50 dark:border-rose-400/20 dark:bg-transparent dark:text-rose-300 dark:hover:bg-rose-400/10"
                >
                  <ShieldAlert className="size-4" />
                  Report this sound
                </Link>
              </div>
            </aside>
          </div>
        </article>

        {/* Related sounds */}
        {related.length > 0 && (
          <section className="mt-12 sm:mt-16">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-wider text-violet-600 uppercase dark:text-violet-400">
                  <Sparkles className="size-3.5" />
                  Keep discovering
                </div>
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  More like this
                </h2>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  More sounds from {sound.categoryName}
                </p>
              </div>

              <Link
                href={`/category/${encodeURIComponent(sound.category.slug)}`}
                className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-violet-700 transition-colors hover:text-violet-500 dark:text-violet-300 dark:hover:text-violet-200"
              >
                View all
                <ArrowUpRight className="size-4" />
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
