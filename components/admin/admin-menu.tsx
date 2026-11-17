"use client"

import Link from "next/link"
import { useState } from "react"
import {
  AlertTriangle,
  FolderTree,
  LayoutDashboard,
  Menu,
  Music,
  UploadCloud,
  Users,
  X,
} from "lucide-react"

export function AdminMenu() {
  const [open, setOpen] = useState(false)

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
            {links.map((link) => {
              const Icon = link.icon
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch={false}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
                >
                  <Icon className="size-4 text-muted-foreground" />
                  <span>{link.label}</span>
                </Link>
              )
            })}
          </nav>
        </>
      )}
    </div>
  )
}
