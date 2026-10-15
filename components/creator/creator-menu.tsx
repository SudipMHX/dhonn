"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X } from "lucide-react"

export function CreatorMenu() {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative block md:hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />

          <nav className="absolute top-full right-0 z-50 mt-2 w-52 rounded-xl border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-800 dark:bg-slate-900">
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Overview
            </Link>

            <Link
              href="/dashboard/upload"
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Upload a sound
            </Link>

            <Link
              href="/dashboard/uploads"
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Manage uploads
            </Link>

            <Link
              href="/dashboard/settings"
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Account settings
            </Link>

            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Public library
            </Link>
          </nav>
        </>
      )}
    </div>
  )
}
