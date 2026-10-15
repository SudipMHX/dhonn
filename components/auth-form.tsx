"use client"

import Link from "next/link"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"

import { Button } from "@/components/ui/button"

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter()
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const register = mode === "register"

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setBusy(true)
    const form = new FormData(event.currentTarget)
    const email = String(form.get("email") ?? "")
    const password = String(form.get("password") ?? "")

    try {
      if (register) {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: form.get("name"), email, password }),
        })
        const result = (await response.json()) as { error?: string }
        if (!response.ok)
          throw new Error(result.error ?? "Account creation failed.")
      }
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })
      if (result?.error) throw new Error("Email or password is incorrect.")
      router.push("/dashboard")
      router.refresh()
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to sign in right now."
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {register && (
        <label className="block text-sm font-medium">
          Your name
          <input
            required
            minLength={2}
            maxLength={80}
            name="name"
            autoComplete="name"
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-900"
          />
        </label>
      )}
      <label className="block text-sm font-medium">
        Email
        <input
          required
          type="email"
          name="email"
          autoComplete="email"
          className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-900"
        />
      </label>
      <label className="block text-sm font-medium">
        Password
        <input
          required
          type="password"
          name="password"
          autoComplete={register ? "new-password" : "current-password"}
          minLength={register ? 10 : undefined}
          maxLength={128}
          className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-900"
        />
        {register && (
          <span className="mt-1 block text-xs font-normal text-slate-500">
            Use at least 10 characters.
          </span>
        )}
      </label>
      {error && (
        <p
          role="alert"
          className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
        >
          {error}
        </p>
      )}
      <Button type="submit" disabled={busy} className="w-full" size="lg">
        {busy ? "Please wait…" : register ? "Create account" : "Sign in"}
      </Button>
      <p className="text-center text-sm text-slate-500">
        {register ? "Already have an account?" : "New to dhonn.?"}{" "}
        <Link
          className="font-semibold text-sky-600 dark:text-sky-400"
          href={register ? "/login" : "/register"}
        >
          {register ? "Sign in" : "Create an account"}
        </Link>
      </p>
    </form>
  )
}
