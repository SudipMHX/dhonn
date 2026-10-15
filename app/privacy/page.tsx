import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = { title: "Privacy" }

export default function PrivacyPage() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-16">
      <Link href="/" className="text-sm font-semibold text-sky-600">
        ← dhonn.
      </Link>
      <h1 className="mt-8 text-4xl font-black">Privacy</h1>
      <p className="mt-5 leading-7 text-slate-600 dark:text-slate-300">
        We store account names and email addresses to operate user accounts,
        favorites, uploads, and moderation. Play events associated with an
        account support the recently played list; anonymous analytics use a
        one-way hash of request metadata and expire after 180 days. Guest
        favorites remain in your browser storage. Audio files are stored in
        private object storage and are available publicly only after moderator
        approval. We do not sell personal information. Contact the site operator
        to request access or deletion, subject to legal and security retention
        requirements.
      </p>
      <h2 className="mt-8 text-xl font-bold">Cookies and sessions</h2>
      <p className="mt-2 leading-7 text-slate-600 dark:text-slate-300">
        Authentication uses a secure session cookie managed by Auth.js.
        Necessary session storage is used only to keep you signed in.
      </p>
      <p className="mt-8 text-xs text-slate-500">
        Update this notice to reflect the operator’s jurisdiction and actual
        retention practices before launch.
      </p>
    </main>
  )
}
