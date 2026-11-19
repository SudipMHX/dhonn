"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  Compass,
  LayoutDashboard,
  Menu,
  Music,
  Settings,
  Shield,
  Upload,
  X,
} from "lucide-react"

export function CreatorMenu({ isAdmin = false }: { isAdmin?: boolean }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const links = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/upload", label: "Upload a sound", icon: Upload },
    { href: "/dashboard/uploads", label: "Manage uploads", icon: Music },
    { href: "/dashboard/settings", label: "Account settings", icon: Settings },
  ]

  return (
    <div className="relative block lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "Close creator menu" : "Open creator menu"}
        aria-expanded={open}
        className="flex size-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground active:scale-95"
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default bg-black/40 backdrop-blur-xs"
          />

          <nav
            aria-label="Creator mobile navigation menu"
            className="absolute top-full right-0 z-50 mt-2 w-64 max-w-[calc(100vw-2rem)] animate-in rounded-2xl border border-border/80 bg-card p-2 shadow-2xl duration-150 fade-in-0 zoom-in-95"
          >
            <div className="px-3 py-1.5 text-[10px] font-semibold tracking-wider text-muted-foreground/70 uppercase">
              Creator Studio
            </div>
            <div className="space-y-0.5">
              {links.map((link) => {
                const Icon = link.icon
                const active =
                  link.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname === link.href ||
                      pathname?.startsWith(`${link.href}/`)

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    prefetch={false}
                    onClick={() => setOpen(false)}
                    className={`flex min-h-[44px] items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-medium transition-colors ${
                      active
                        ? "bg-indigo-50 font-semibold text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300"
                        : "text-foreground hover:bg-secondary"
                    }`}
                  >
                    <Icon
                      className={`size-4.5 shrink-0 ${
                        active
                          ? "text-indigo-600 dark:text-indigo-400"
                          : "text-muted-foreground"
                      }`}
                    />
                    <span>{link.label}</span>
                  </Link>
                )
              })}
            </div>

            <div className="my-2 border-t border-border/60" />

            <div className="px-3 py-1 text-[10px] font-semibold tracking-wider text-muted-foreground/70 uppercase">
              Platform
            </div>
            <div className="space-y-0.5">
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  className="flex min-h-[44px] items-center gap-3 rounded-xl px-3.5 py-2 text-xs font-medium text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/50"
                >
                  <Shield className="size-4.5 shrink-0" />
                  <span>Admin Console</span>
                </Link>
              )}

              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="flex min-h-[44px] items-center gap-3 rounded-xl px-3.5 py-2 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <Compass className="size-4.5 shrink-0" />
                <span>Public Soundboard</span>
              </Link>
            </div>
          </nav>
        </>
      )}
    </div>
  )
}
