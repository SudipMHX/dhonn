import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = { title: "Terms" }

export default function TermsPage() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-16">
      <Link href="/" className="text-sm font-semibold text-sky-600">
        ← dhonn.
      </Link>
      <h1 className="mt-8 text-4xl font-black">Terms of use</h1>
      <p className="mt-5 leading-7 text-slate-600 dark:text-slate-300">
        Only upload audio you created or are legally authorized to share. Do not
        submit unlawful, harmful, or infringing material. Submissions remain
        private until approved, and we may reject or remove content that
        violates these terms or a valid rights comdhonn.t. You retain rights you
        hold in your work and grant the site operator permission to store,
        review, and deliver content you submit for the service. You are
        responsible for your account and password. Access may be suspended for
        abuse.
      </p>
      <p className="mt-5 leading-7 text-slate-600 dark:text-slate-300">
        This starter notice is not legal advice. Have counsel review and adapt
        it before public launch.
      </p>
    </main>
  )
}
