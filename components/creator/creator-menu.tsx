"use client"

import Link from "next/link"
import { useState } from "react"
import {
  Compass,
  LayoutDashboard,
  Menu,
  Music,
  Settings,
  Upload,
  X,
} from "lucide-react"

export function CreatorMenu() {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative block md:hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        className="flex size-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      >
        {open ? <X className="size-4" /> : <Menu className="size-4" />}
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default bg-black/20 backdrop-blur-xs"
          />

          <nav className="absolute top-full right-0 z-50 mt-2 w-56 rounded-2xl border border-border/80 bg-card p-1.5 shadow-xl shadow-black/10 backdrop-blur-xl animate-in fade-in-0 zoom-in-95 duration-150">
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
            >
              <LayoutDashboard className="size-4 text-muted-foreground" />
              <span>Overview</span>
            </Link>

            <Link
              href="/dashboard/upload"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
            >
              <Upload className="size-4 text-muted-foreground" />
              <span>Upload a sound</span>
            </Link>

            <Link
              href="/dashboard/uploads"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
            >
              <Music className="size-4 text-muted-foreground" />
              <span>Manage uploads</span>
            </Link>

            <Link
              href="/dashboard/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
            >
              <Settings className="size-4 text-muted-foreground" />
              <span>Account settings</span>
            </Link>

            <div className="my-1 border-t border-border/60" />

            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <Compass className="size-4" />
              <span>Public library</span>
            </Link>
          </nav>
        </>
      )}
    </div>
  )
}
