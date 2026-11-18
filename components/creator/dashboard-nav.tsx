"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Compass, LayoutDashboard, Music, Settings, Upload } from "lucide-react"

const NAV_GROUPS = [
  {
    title: "Studio Navigation",
    items: [
      {
        href: "/dashboard",
        label: "Overview",
        icon: LayoutDashboard,
        exact: true,
      },
      {
        href: "/dashboard/upload",
        label: "Upload a Sound",
        icon: Upload,
        exact: true,
      },
      {
        href: "/dashboard/uploads",
        label: "Manage Uploads",
        icon: Music,
        exact: false,
      },
      {
        href: "/dashboard/settings",
        label: "Account Settings",
        icon: Settings,
        exact: false,
      },
    ],
  },
  {
    title: "Community",
    items: [
      {
        href: "/",
        label: "Public Soundboard",
        icon: Compass,
        exact: true,
      },
    ],
  },
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-6" aria-label="Creator Studio Navigation">
      {NAV_GROUPS.map((group) => (
        <div key={group.title} className="space-y-1">
          <p className="px-3 text-[10px] font-semibold tracking-wider text-muted-foreground/70 uppercase">
            {group.title}
          </p>
          <div className="space-y-0.5">
            {group.items.map((item) => {
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
                      ? "bg-indigo-50/90 font-semibold text-indigo-700 shadow-xs dark:bg-indigo-950/50 dark:text-indigo-300"
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
    </nav>
  )
}
