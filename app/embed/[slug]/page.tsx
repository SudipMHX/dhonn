import { notFound } from "next/navigation"

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
    <main className="grid min-h-screen place-items-center bg-slate-100 p-3 dark:bg-slate-950">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <p className="text-xs font-semibold tracking-widest text-sky-600 uppercase">
          dhonn. sound
        </p>
        <h1 className="mt-1 text-lg font-bold">{sound.title}</h1>
        <audio
          controls
          preload="none"
          src={`/api/sounds/${encodeURIComponent(sound.slug)}/audio`}
          className="mt-4 w-full"
        />
        <a
          href={`/sound/${encodeURIComponent(sound.slug)}`}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-block text-xs text-slate-500 hover:text-sky-600"
        >
          Listen on dhonn.
        </a>
      </div>
    </main>
  )
}
