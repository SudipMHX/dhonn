import Link from "next/link"
import { redirect } from "next/navigation"

import { AuthForm } from "@/components/auth-form"
import { auth } from "@/lib/auth"

export const metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
}

export default async function LoginPage() {
  const session = await auth()
  if (session?.user) redirect("/dashboard")
  return (
    <main className="grid min-h-screen place-items-center bg-slate-100 px-4 py-12 dark:bg-slate-950">
      <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-7 shadow-xl sm:p-9 dark:border-slate-800 dark:bg-slate-900">
        <Link
          href="/"
          className="text-sm font-bold tracking-tight text-sky-600"
        >
          ← dhonn.
        </Link>
        <h1 className="mt-7 text-3xl font-black">Welcome back</h1>
        <p className="mt-2 mb-7 text-sm text-slate-500">
          Sign in to save favorites and manage your sounds.
        </p>
        <AuthForm mode="login" />
      </div>
    </main>
  )
}
