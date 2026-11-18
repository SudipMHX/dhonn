import Link from "next/link"
import { redirect } from "next/navigation"
import { Volume2 } from "lucide-react"

import { AuthForm } from "@/components/auth-form"
import { auth } from "@/lib/auth"

export const metadata = {
  title: "Create your account",
  robots: { index: false, follow: false },
}

export default async function RegisterPage() {
  const session = await auth()
  if (session?.user) redirect("/dashboard")

  return (
    <main className="relative grid min-h-[85vh] place-items-center px-4 py-12">
      {/* Ambient background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -z-10 size-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-[120px]"
      />

      <div className="w-full max-w-md rounded-2xl border border-border/80 bg-card p-7 shadow-xl shadow-black/[0.03] sm:p-9 dark:shadow-black/25">
        <div className="mb-8 flex flex-col items-center text-center">
          <Link
            href="/"
            className="group mb-5 flex size-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs shadow-indigo-600/30 transition-transform hover:scale-105"
            aria-label="dhonn home"
          >
            <Volume2 className="size-5" strokeWidth={2.5} />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Create an account
          </h1>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Join dhonn to publish sounds, curate favorites across devices, and
            share audio.
          </p>
        </div>

        <AuthForm mode="register" />
      </div>
    </main>
  )
}
