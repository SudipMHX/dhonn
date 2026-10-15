import { ReportForm } from "@/components/report-form"
import Link from "next/link"

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
    <main className="mx-auto min-h-screen max-w-4xl px-4 py-12 sm:px-6">
      <Link href="/" className="text-sm font-semibold text-sky-600">
        ← dhonn.
      </Link>
      <h1 className="mt-8 text-4xl font-black">Report a sound</h1>
      <p className="mt-3 mb-6 max-w-2xl text-slate-600 dark:text-slate-300">
        Use this form to report copyright concerns or other content issues.
        Reports are reviewed by the moderation team.
      </p>
      <ReportForm soundId={sound} />
    </main>
  )
}
