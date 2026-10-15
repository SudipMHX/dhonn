import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = { title: "Contact" }

export default function ContactPage() {
  const email = process.env.CONTACT_EMAIL
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-16">
      <Link href="/" className="text-sm font-semibold text-sky-600">
        ← dhonn.
      </Link>
      <h1 className="mt-8 text-4xl font-black">Get in touch</h1>
      <p className="mt-5 leading-7 text-slate-600 dark:text-slate-300">
        For content or copyright concerns, use our{" "}
        <Link href="/report" className="font-semibold text-sky-600">
          report form
        </Link>
        .
        {email ? (
          <>
            {" "}
            For other questions, email{" "}
            <a className="font-semibold text-sky-600" href={`mailto:${email}`}>
              {email}
            </a>
            .
          </>
        ) : (
          " For general inquiries, please contact the site operator."
        )}
      </p>
    </main>
  )
}
