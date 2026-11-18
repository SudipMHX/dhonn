"use client"

import Link from "next/link"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { FormEvent, useCallback, useEffect, useState } from "react"
import { RotateCw } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { cn } from "cn"
import { getCaptchaAction } from "@/lib/actions/captcha"

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter()
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const [captcha, setCaptcha] = useState<{ token: string; svg: string } | null>(
    null
  )
  const [captchaLoading, setCaptchaLoading] = useState(false)
  const [captchaAnswer, setCaptchaAnswer] = useState("")
  const register = mode === "register"

  const refreshCaptcha = useCallback(async () => {
    setCaptchaLoading(true)
    try {
      const data = await getCaptchaAction()
      setCaptcha(data)
      setCaptchaAnswer("")
    } catch (cause) {
      console.error("Failed to load captcha", cause)
    } finally {
      setCaptchaLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshCaptcha()
  }, [refreshCaptcha])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setBusy(true)
    const form = new FormData(event.currentTarget)
    const email = String(form.get("email") ?? "")
    const password = String(form.get("password") ?? "")

    try {
      if (!captcha?.token) {
        throw new Error("Please wait for security verification to load.")
      }
      if (!captchaAnswer.trim()) {
        throw new Error("Please enter the security verification code.")
      }

      if (register) {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.get("name"),
            email,
            password,
            captchaToken: captcha.token,
            captchaAnswer: captchaAnswer.trim(),
          }),
        })
        const result = (await response.json()) as { error?: string }
        if (!response.ok) {
          throw new Error(result.error ?? "Account creation failed.")
        }
        toast.success("Account created successfully! Please sign in.")
        router.push("/login")
        router.refresh()
        return
      }

      const result = await signIn("credentials", {
        email,
        password,
        captchaToken: captcha.token,
        captchaAnswer: captchaAnswer.trim(),
        redirect: false,
      })

      if (result?.error) {
        if (
          result.code === "captcha_failed" ||
          result.error === "captcha_failed" ||
          result.error.toLowerCase().includes("captcha")
        ) {
          throw new Error("Invalid or expired captcha. Please try again.")
        }
        throw new Error("Email or password is incorrect.")
      }

      router.push("/dashboard")
      router.refresh()
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to sign in right now."
      )
      refreshCaptcha()
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {register && (
        <div className="space-y-1.5">
          <label
            htmlFor="auth-name"
            className="text-xs font-semibold text-foreground"
          >
            Display Name
          </label>
          <input
            id="auth-name"
            required
            minLength={2}
            maxLength={80}
            name="name"
            autoComplete="name"
            placeholder="Alex Rivers"
            className="h-10 w-full rounded-xl border border-input bg-card px-3.5 text-sm text-foreground transition-all placeholder:text-muted-foreground/60 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
          />
        </div>
      )}

      <div className="space-y-1.5">
        <label
          htmlFor="auth-email"
          className="text-xs font-semibold text-foreground"
        >
          Email Address
        </label>
        <input
          id="auth-email"
          required
          type="email"
          name="email"
          autoComplete="email"
          placeholder="name@domain.com"
          className="h-10 w-full rounded-xl border border-input bg-card px-3.5 text-sm text-foreground transition-all placeholder:text-muted-foreground/60 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="auth-password"
            className="text-xs font-semibold text-foreground"
          >
            Password
          </label>
          {register && (
            <span className="text-[11px] text-muted-foreground">
              Min. 10 characters
            </span>
          )}
        </div>
        <input
          id="auth-password"
          required
          type="password"
          name="password"
          autoComplete={register ? "new-password" : "current-password"}
          minLength={register ? 10 : undefined}
          maxLength={128}
          placeholder="••••••••••••"
          className="h-10 w-full rounded-xl border border-input bg-card px-3.5 text-sm text-foreground transition-all placeholder:text-muted-foreground/60 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
        />
      </div>

      {/* Security Captcha Card */}
      <div className="space-y-2 rounded-xl border border-border/80 bg-muted/20 p-3">
        <div className="flex items-center justify-between">
          <label
            htmlFor="auth-captcha"
            className="text-xs font-semibold text-foreground"
          >
            Security Verification
          </label>
          <span className="text-[11px] text-muted-foreground">
            Case-insensitive
          </span>
        </div>

        <div className="flex items-center gap-2">
          {captcha ? (
            <img
              src={captcha.svg}
              alt="Security Captcha"
              className="h-10 rounded-lg border border-border/80 bg-background/50 object-contain px-2"
            />
          ) : (
            <div className="flex h-10 w-40 items-center justify-center rounded-lg border border-border/80 bg-background/50 text-xs text-muted-foreground">
              <RotateCw className="size-4 animate-spin text-muted-foreground" />
            </div>
          )}

          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={refreshCaptcha}
            disabled={captchaLoading || busy}
            aria-label="Refresh captcha"
            title="Refresh captcha"
          >
            <RotateCw
              className={cn("size-4", captchaLoading && "animate-spin")}
            />
          </Button>
        </div>

        <input
          id="auth-captcha"
          name="captchaAnswer"
          required
          autoComplete="off"
          value={captchaAnswer}
          onChange={(event) =>
            setCaptchaAnswer(event.target.value.toUpperCase())
          }
          placeholder="Enter code above"
          className="h-10 w-full rounded-xl border border-input bg-card px-3.5 text-sm tracking-wider text-foreground uppercase transition-all placeholder:tracking-normal placeholder:text-muted-foreground/60 placeholder:normal-case focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
        />
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-rose-200/80 bg-rose-50/70 p-3 text-xs font-medium text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300"
        >
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={busy}
        variant="primary"
        size="lg"
        className="mt-2 w-full font-semibold"
      >
        {busy ? "Please wait…" : register ? "Create Account" : "Sign In"}
      </Button>

      <div className="pt-2 text-center text-xs text-muted-foreground">
        {register ? "Already have an account?" : "Don't have an account yet?"}{" "}
        <Link
          className="font-semibold text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400"
          href={register ? "/login" : "/register"}
        >
          {register ? "Sign in" : "Sign up"}
        </Link>
      </div>
    </form>
  )
}
