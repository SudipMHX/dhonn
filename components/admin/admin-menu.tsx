"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X } from "lucide-react"

export function AdminMenu() {
  const [open, setOpen] = useState(false)

  const links = [
    { href: "/admin", label: "Overview" },
    { href: "/admin/uploads", label: "Review uploads" },
    { href: "/admin/sounds", label: "Manage sounds" },
    { href: "/admin/reports", label: "Reports" },
    { href: "/admin/categories", label: "Categories" },
    { href: "/admin/users", label: "Users" },
  ]

  return (
    <div className="relative block lg:hidden">
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
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                prefetch={false}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </>
      )}
    </div>
  )
}
