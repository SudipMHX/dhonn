"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  AlertTriangle,
  FolderTree,
  LayoutDashboard,
  Music,
  UploadCloud,
  Users,
} from "lucide-react"

const NAV_SECTIONS = [
  {
    title: "Platform",
    items: [
      {
        href: "/admin",
        label: "Overview & Metrics",
        icon: LayoutDashboard,
        exact: true,
      },
    ],
  },
  {
    title: "Curation & Moderation",
    items: [
      {
        href: "/admin/uploads",
        label: "Review Uploads",
        icon: UploadCloud,
        exact: false,
      },
      {
        href: "/admin/sounds",
        label: "Manage Sounds",
        icon: Music,
        exact: false,
      },
      {
        href: "/admin/reports",
        label: "Content Reports",
        icon: AlertTriangle,
        exact: false,
      },
    ],
  },
  {
    title: "Taxonomy & Access",
    items: [
      {
        href: "/admin/categories",
        label: "Sound Categories",
        icon: FolderTree,
        exact: false,
      },
      {
        href: "/admin/users",
        label: "User Accounts",
        icon: Users,
        exact: false,
      },
    ],
  },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-6" aria-label="Admin Navigation">
      {NAV_SECTIONS.map((section) => (
        <div key={section.title} className="space-y-1">
          <p className="px-3 text-[10px] font-semibold tracking-wider text-muted-foreground/70 uppercase">
            {section.title}
          </p>
          <div className="space-y-0.5">
            {section.items.map((item) => {
              const Icon = item.icon
              const active = item.exact
                ? pathname === item.href
                : pathname === item.href ||
                  pathname?.startsWith(`${item.href}/`)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={false}
                  className={`group relative flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium transition-all duration-150 ${
                    active
                      ? "bg-indigo-50/90 text-indigo-700 shadow-xs dark:bg-indigo-950/50 dark:text-indigo-300"
                      : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground"
                  }`}
                >
                  {active && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-y-1.5 left-0 w-1 rounded-r-full bg-indigo-600 dark:bg-indigo-400"
                    />
                  )}
                  <Icon
                    className={`size-4 transition-colors ${
                      active
                        ? "text-indigo-600 dark:text-indigo-400"
                        : "text-muted-foreground/70 group-hover:text-foreground"
                    }`}
                  />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      ))}

      {/* System Status Pill */}
      <div className="mt-auto border-t border-border/60 px-3 pt-4">
        <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
          </span>
          <span>Admin Service Active</span>
        </div>
      </div>
    </nav>
  )
}
