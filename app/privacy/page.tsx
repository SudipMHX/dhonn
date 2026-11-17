import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, Lock } from "lucide-react"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy and data retention practices for dhonn.",
}

export default function PrivacyPage() {
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
          <Lock className="size-3.5" />
          <span>Legal &amp; Privacy</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="text-xs text-muted-foreground">
          Last revised: November 2026
        </p>
      </div>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-muted-foreground">
        <section className="space-y-3">
          <h2 className="text-base font-bold text-foreground">
            1. Information Collection &amp; Use
          </h2>
          <p>
            We collect account display names and email addresses solely to authenticate users, manage audio submissions, synchronize favorite sound lists, and handle content moderation.
          </p>
          <p>
            Playback events associated with an authenticated account are utilized to provide personalized history (&ldquo;Recently Played&rdquo;). Anonymous analytics use a one-way cryptographic hash of request metadata and expire automatically after 180 days.
          </p>
          <p>
            Guest favorites remain stored locally within browser storage and are never transmitted to external servers without an account.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-foreground">
            2. Audio Storage &amp; Security
          </h2>
          <p>
            User-uploaded audio files are securely held in private cloud object storage. Uploaded tracks remain completely unlisted and private until approved by an administrator through the moderation queue. We do not sell or monetize personal user data to third parties.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-foreground">
            3. Cookies &amp; Sessions
          </h2>
          <p>
            Authentication operates via a secure, encrypted HTTP-only session cookie managed by Auth.js. Local browser storage is strictly utilized for client UI preferences (such as light or dark color theme) and service-worker audio playback caching.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-foreground">
            4. Data Access &amp; Deletion
          </h2>
          <p>
            You may request complete deletion of your account and uploaded audio recordings at any time through account settings or by contacting the site operator.
          </p>
        </section>
      </div>
    </main>
  )
}
