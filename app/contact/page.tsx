import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowLeft,
  ArrowRight,
  Mail,
  MessageSquare,
  ShieldAlert,
} from "lucide-react"

export const metadata: Metadata = {
  title: "Contact dhonn.",
  description:
    "Get in touch with the dhonn team for general questions or copyright reports.",
}

export default function ContactPage() {
  const email = process.env.CONTACT_EMAIL

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
        <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200/60 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300">
          <MessageSquare className="size-3.5" />
          <span>Support &amp; Inquiries</span>
        </div>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-foreground sm:mt-4 sm:text-4xl">
          Get in touch
        </h1>
        <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
          Have a question about dhonn, audio rights, or general platform
          operations? We&apos;re here to assist.
        </p>
      </div>

      {/* Contact Cards Grid */}
      <div className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-2 sm:gap-5">
        {/* Content & Copyright Report */}
        <div className="flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-5 shadow-xs sm:p-6">
          <div>
            <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
              <ShieldAlert className="size-5" />
            </div>
            <h2 className="font-bold text-foreground">
              Content &amp; Copyright
            </h2>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              If you believe a sound violates your copyright or community
              guidelines, submit an official takedown report.
            </p>
          </div>
          <div className="mt-5 sm:mt-6">
            <Link
              href="/report"
              className="inline-flex h-10 w-full touch-manipulation items-center justify-center gap-1.5 rounded-xl border border-border bg-secondary/60 px-4 text-xs font-semibold text-foreground transition-colors hover:bg-secondary active:scale-95 sm:w-auto"
            >
              <span>Submit a report</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>

        {/* General Inquiries */}
        <div className="flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-5 shadow-xs sm:p-6">
          <div>
            <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
              <Mail className="size-5" />
            </div>
            <h2 className="font-bold text-foreground">Direct Email</h2>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              {email
                ? "Send us a direct note for partnerships, platform feedback, or operational inquiries."
                : "For general inquiries, platform feedback, or creator support."}
            </p>
          </div>
          <div className="mt-5 sm:mt-6">
            {email ? (
              <a
                href={`mailto:${email}`}
                className="inline-flex h-10 w-full touch-manipulation items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 text-xs font-semibold text-white shadow-xs shadow-indigo-600/30 transition-all hover:bg-indigo-500 active:scale-95 sm:w-auto"
              >
                <Mail className="size-3.5" />
                <span>{email}</span>
              </a>
            ) : (
              <span className="text-xs text-muted-foreground italic">
                Direct contact email configured via site operator.
              </span>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
