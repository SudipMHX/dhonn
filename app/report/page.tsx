import { ReportForm } from "@/components/report-form"
import Link from "next/link"
import { ArrowLeft, ShieldAlert } from "lucide-react"

export const metadata = {
  title: "Report content",
  robots: { index: false, follow: false },
}

export default async function ReportPage({
  searchParams,
}: {
  searchParams: Promise<{ sound?: string }>
}) {
  const { sound = "" } = await searchParams

  return (
    <main className="mx-auto min-h-[75vh] max-w-3xl px-3 py-6 sm:px-6 sm:py-12 lg:px-8">
      {/* Back button */}
      <Link
        href="/"
        className="inline-flex touch-manipulation items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground active:scale-95"
      >
        <ArrowLeft className="size-3.5" />
        <span>Back to soundboard</span>
      </Link>

      {/* Header */}
      <div className="mt-6 space-y-2.5 sm:mt-8 sm:space-y-3">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-rose-200/60 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
          <ShieldAlert className="size-3.5" />
          <span>Content Moderation</span>
        </div>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-foreground sm:mt-4 sm:text-4xl">
          Report a Sound
        </h1>
        <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
          Submit copyright claims, intellectual property concerns, or
          inappropriate content notifications directly to our moderation team.
        </p>
      </div>

      <div className="mt-6 sm:mt-8">
        <ReportForm soundId={sound} />
      </div>
    </main>
  )
}
