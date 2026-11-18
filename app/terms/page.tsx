import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, FileText } from "lucide-react"

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms and conditions for publishing and consuming audio on dhonn.",
}

export default function TermsPage() {
  return (
    <main className="mx-auto min-h-[75vh] max-w-3xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        <span>Back to soundboard</span>
      </Link>

      {/* Header */}
      <div className="mt-8 space-y-3 border-b border-border/80 pb-6">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200/60 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300">
          <FileText className="size-3.5" />
          <span>Legal Agreement</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Terms of Service
        </h1>
        <p className="text-xs text-muted-foreground">
          Last revised: November 2026
        </p>
      </div>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-muted-foreground">
        <section className="space-y-3">
          <h2 className="text-base font-bold text-foreground">
            1. Acceptance &amp; Scope
          </h2>
          <p>
            By accessing dhonn, browsing audio recordings, creating an account,
            or submitting audio clips, you agree to comply with and be bound by
            these Terms of Service.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-foreground">
            2. Creator Audio Submissions &amp; Rights
          </h2>
          <p>
            You may only upload audio you personally recorded, created, or
            possess documented licensing and legal authorization to distribute.
            Submitting copyrighted, infringing, defamatory, abusive, or unlawful
            audio is strictly prohibited.
          </p>
          <p>
            You retain all underlying intellectual property rights in your
            original recordings. By submitting audio to dhonn, you grant the
            platform a non-exclusive, worldwide, royalty-free license to store,
            transcode, moderate, display, and stream your audio to platform
            listeners.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-foreground">
            3. Moderation &amp; Removal
          </h2>
          <p>
            Every audio submission remains private until approved by a platform
            moderator. dhonn reserves the right to decline, unpublish, or
            permanently delete any recording that violates platform quality
            rules or is subject to a valid copyright infringement notice.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-foreground">
            4. Account Responsibility
          </h2>
          <p>
            You are responsible for safeguarding your login credentials and for
            all activities originating from your account. Accounts exhibiting
            abusive behavior, spamming, or repeated copyright infringements are
            subject to immediate suspension.
          </p>
        </section>
      </div>
    </main>
  )
}
