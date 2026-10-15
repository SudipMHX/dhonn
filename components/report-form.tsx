"use client"

import { Button } from "@/components/ui/button"
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
      className="rounded-2xl bg-emerald-50 p-5 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"
    >
      Thanks. Your report has been sent to the moderation team.
    </div>
  ) : (
    <form
      onSubmit={submit}
      className="max-w-2xl space-y-4 rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
    >
      <label className="block text-sm font-medium">
        Sound ID
        <input
          name="soundId"
          required
          defaultValue={soundId}
          pattern="[a-fA-F0-9]{24}"
          placeholder="Paste the sound ID"
          className="mt-1.5 w-full rounded-xl border border-slate-200 bg-transparent px-4 py-3 dark:border-slate-700"
        />
      </label>
      <label className="block text-sm font-medium">
        Report type
        <select
          name="type"
          className="mt-1.5 w-full rounded-xl border border-slate-200 bg-transparent px-4 py-3 dark:border-slate-700"
        >
          <option value="copyright">Copyright comdhonn.t</option>
          <option value="inappropriate">Inappropriate content</option>
          <option value="other">Other concern</option>
        </select>
      </label>
      <label className="block text-sm font-medium">
        Details
        <textarea
          name="details"
          required
          minLength={20}
          maxLength={2000}
          rows={5}
          className="mt-1.5 w-full rounded-xl border border-slate-200 bg-transparent px-4 py-3 dark:border-slate-700"
          placeholder="Tell us what happened. For copyright reports, identify the work and exdhonn. your relationship to it."
        />
      </label>
      <label className="block text-sm font-medium">
        Email for follow-up{" "}
        <span className="font-normal text-slate-500">(optional)</span>
        <input
          name="email"
          type="email"
          maxLength={254}
          className="mt-1.5 w-full rounded-xl border border-slate-200 bg-transparent px-4 py-3 dark:border-slate-700"
        />
      </label>
      {error && (
        <p role="alert" className="text-sm text-rose-700 dark:text-rose-300">
          {error}
        </p>
      )}
      <Button type="submit" size="lg">
        Send report
      </Button>
    </form>
  )
}
