"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  AlertTriangle,
  ArrowRight,
  FolderTree,
  Globe,
  LayoutDashboard,
  Menu,
  Music,
  UploadCloud,
  Users,
  X,
} from "lucide-react"

export function AdminMenu() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const links = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/uploads", label: "Review uploads", icon: UploadCloud },
    { href: "/admin/sounds", label: "Manage sounds", icon: Music },
    { href: "/admin/reports", label: "Content reports", icon: AlertTriangle },
    { href: "/admin/categories", label: "Categories", icon: FolderTree },
    { href: "/admin/users", label: "Users", icon: Users },
  ]

  return (
    <div className="relative block lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "Close admin menu" : "Open admin menu"}
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
            aria-label="Admin mobile navigation menu"
            className="absolute top-full right-0 z-50 mt-2 w-64 max-w-[calc(100vw-2rem)] animate-in rounded-2xl border border-border/80 bg-card p-2 shadow-2xl duration-150 fade-in-0 zoom-in-95"
          >
            <div className="px-3 py-1.5 text-[10px] font-semibold tracking-wider text-muted-foreground/70 uppercase">
              Admin Sections
            </div>
            <div className="space-y-0.5">
              {links.map((link) => {
                const Icon = link.icon
                const active =
                  link.href === "/admin"
                    ? pathname === "/admin"
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
              Navigation
            </div>
            <div className="space-y-0.5">
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="flex min-h-[44px] items-center justify-between rounded-xl px-3.5 py-2 text-xs font-medium text-foreground hover:bg-secondary"
              >
                <span>Creator Studio</span>
                <ArrowRight className="size-3.5 text-muted-foreground" />
              </Link>
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="flex min-h-[44px] items-center justify-between rounded-xl px-3.5 py-2 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <span className="flex items-center gap-2">
                  <Globe className="size-3.5" />
                  <span>Public Soundboard</span>
                </span>
                <ArrowRight className="size-3.5 text-muted-foreground" />
              </Link>
            </div>
          </nav>
        </>
      )}
    </div>
  )
}
