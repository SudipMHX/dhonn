"use client"

import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"
import { FormEvent, useState } from "react"

export function ReportForm({ soundId = "" }: { soundId?: string }) {
  const [error, setError] = useState("")
  const [submitted, setSubmitted] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          soundId: form.get("soundId"),
          type: form.get("type"),
          details: form.get("details"),
          email: form.get("email"),
        }),
      })
      const result = (await response.json()) as { error?: string }
      if (!response.ok) {
        setError(result.error ?? "Your report could not be sent.")
        return
      }
      formElement.reset()
      setSubmitted(true)
    } catch {
      setError(
        "Your report could not be sent. Check your connection and try again."
      )
    }
  }

  return submitted ? (
    <div
      role="status"
      className="flex items-start gap-3 rounded-2xl border border-emerald-200/80 bg-emerald-50/70 p-6 text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200"
    >
      <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
      <div>
        <p className="text-sm font-semibold">Report submitted successfully</p>
        <p className="mt-1 text-xs leading-relaxed text-emerald-800 dark:text-emerald-300">
          Thank you for helping keep the community safe. Our moderation team
          will investigate this report and take appropriate action.
        </p>
      </div>
    </div>
  ) : (
    <form
      onSubmit={submit}
      className="space-y-5 rounded-2xl border border-border/80 bg-card p-6 shadow-xs sm:p-8"
    >
      <div className="space-y-1.5">
        <label
          htmlFor="report-sound-id"
          className="text-xs font-semibold text-foreground"
        >
          Sound ID
        </label>
        <input
          id="report-sound-id"
          name="soundId"
          required
          defaultValue={soundId}
          pattern="[a-fA-F0-9]{24}"
          placeholder="24-character hexadecimal Sound ID"
          className="h-10 w-full rounded-xl border border-input bg-card px-3.5 font-mono text-sm text-foreground transition-all placeholder:text-muted-foreground/60 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
        />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="report-type"
          className="text-xs font-semibold text-foreground"
        >
          Report Category
        </label>
        <select
          id="report-type"
          name="type"
          className="h-10 w-full rounded-xl border border-input bg-card px-3 text-sm text-foreground transition-all outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
        >
          <option value="copyright">Copyright or Intellectual Property</option>
          <option value="inappropriate">
            Inappropriate or Harmful Content
          </option>
          <option value="other">Other Concern</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="report-details"
          className="text-xs font-semibold text-foreground"
        >
          Report Details
        </label>
        <textarea
          id="report-details"
          name="details"
          required
          minLength={20}
          maxLength={2000}
          rows={5}
          className="w-full rounded-xl border border-input bg-card p-3.5 text-sm text-foreground transition-all placeholder:text-muted-foreground/60 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
          placeholder="Please describe the violation in detail. For copyright reports, identify the original work and your authority or relationship to it."
        />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="report-email"
          className="text-xs font-semibold text-foreground"
        >
          Email for Follow-up{" "}
          <span className="font-normal text-muted-foreground">(optional)</span>
        </label>
        <input
          id="report-email"
          name="email"
          type="email"
          maxLength={254}
          placeholder="you@domain.com"
          className="h-10 w-full rounded-xl border border-input bg-card px-3.5 text-sm text-foreground transition-all placeholder:text-muted-foreground/60 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
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
        variant="destructive"
        size="md"
        className="w-full sm:w-auto"
      >
        Submit Report
      </Button>
    </form>
  )
}
