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

const ADMIN_NAV_ITEMS = [
  {
    href: "/admin",
    label: "Overview",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: "/admin/uploads",
    label: "Uploads",
    icon: UploadCloud,
    exact: false,
  },
  {
    href: "/admin/sounds",
    label: "Sounds",
    icon: Music,
    exact: false,
  },
  {
    href: "/admin/reports",
    label: "Reports",
    icon: AlertTriangle,
    exact: false,
  },
  {
    href: "/admin/categories",
    label: "Categories",
    icon: FolderTree,
    exact: false,
  },
  {
    href: "/admin/users",
    label: "Users",
    icon: Users,
    exact: false,
  },
]

export function AdminMobileNav() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Admin quick navigation"
      className="sticky top-14 z-20 -mx-3 mb-6 border-b border-border/70 bg-card/90 px-3 py-2 shadow-xs backdrop-blur-md sm:-mx-6 sm:px-6 lg:hidden"
    >
      <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto scroll-smooth">
        {ADMIN_NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const active = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname?.startsWith(`${item.href}/`)

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-[44px] shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all duration-150 active:scale-95 ${
                active
                  ? "bg-indigo-600 text-white shadow-xs shadow-indigo-600/30"
                  : "bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <Icon
                className={`size-4 shrink-0 ${active ? "text-white" : "text-muted-foreground"}`}
              />
              <span className="whitespace-nowrap">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
