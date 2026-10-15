"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import {
  CircleUserRound,
  Compass,
  Grid2X2,
  Home,
  LayoutDashboard,
  Library,
  LogOut,
  Music2,
  Search,
  Settings,
  Sparkles,
  Upload,
  User,
} from "lucide-react"

import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "./ui/button"

type HeaderUser = {
  name?: string | null
  email?: string | null
  role: "user" | "admin"
}

// iOS-style "settle" curve — fast start, soft landing
const ISLAND_EASE = "ease-[cubic-bezier(0.32,0.72,0,1)]"

export function SiteHeader({ user }: { user: HeaderUser | null }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  // Shrink the island on scroll (with hysteresis so it never flickers)
  useEffect(() => {
    let frame = 0

    function update() {
      frame = 0
      const y = window.scrollY
      setScrolled((prev) => (y > 40 ? true : y < 10 ? false : prev))
    }

    function onScroll() {
      if (!frame) frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  useEffect(() => {
    if (!menuOpen) return

    function handlePointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false)
    }

    document.addEventListener("pointerdown", handlePointerDown)
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [menuOpen])

  return (
    <>
      {/* Floating wrapper: sticky, lets clicks pass through the empty sides */}
      <header className="pointer-events-none sticky top-3 z-40 mt-3 px-3 sm:px-4">
        <div
          style={{ width: "var(--island-w)" }}
          className={`pointer-events-auto mx-auto flex items-center justify-between gap-3 rounded-full border px-3 backdrop-blur-xl transition-[width,padding,background-color,border-color,box-shadow] duration-500 motion-reduce:transition-none sm:px-4 ${ISLAND_EASE} ${
            scrolled
              ? "border-slate-200 bg-white/90 py-2.5 shadow-lg shadow-slate-900/10 [--island-w:min(70%,19rem)] max-md:py-1.5 md:[--island-w:min(100%,80rem)] dark:border-slate-700 dark:bg-slate-950/90 dark:shadow-black/40"
              : "border-slate-200/70 bg-white/70 py-2.5 shadow-sm [--island-w:min(100%,80rem)] dark:border-slate-800 dark:bg-slate-950/70"
          }`}
        >
          <Link
            href="/"
            className="flex shrink-0 items-center gap-3 pl-1"
            aria-label="dhonn. home"
          >
            <span className="text-lg font-semibold text-slate-950 dark:text-white">
              dhonn.
            </span>
          </Link>

          {/* Desktop nav only — phones use the bottom nav, so no menu here */}
          <nav
            aria-label="Main navigation"
            className="hidden items-center gap-6 text-sm text-slate-600 md:flex dark:text-slate-300"
          >
            <Link href="/featured" className="hover:text-sky-500">
              Featured
            </Link>
            <Link href="/category" className="hover:text-sky-500">
              Categories
            </Link>
            <Link href="/search" className="hover:text-sky-500">
              Explore
            </Link>
            <Link href="/dashboard" className="hover:text-sky-500">
              Your library
            </Link>
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <form
              action="/search"
              role="search"
              className="hidden items-center rounded-full border border-slate-200 bg-slate-50 text-sm text-slate-500 md:flex dark:border-slate-700 dark:bg-slate-900"
            >
              <label
                htmlFor="site-search"
                className="flex size-9 cursor-pointer items-center justify-center"
              >
                <span className="sr-only">Search sounds</span>
                <Search aria-hidden="true" className="size-4" />
              </label>
              <input
                id="site-search"
                name="q"
                type="search"
                placeholder="Search sounds"
                className="mr-3 w-28 bg-transparent outline-none placeholder:text-slate-400 lg:w-40"
              />
            </form>

            <ThemeToggle />

            {user ? (
              <div className="relative" ref={menuRef}>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  aria-label={
                    menuOpen ? "Close account menu" : "Open account menu"
                  }
                  aria-haspopup="true"
                  aria-expanded={menuOpen}
                  aria-controls="account-menu"
                  onClick={() => setMenuOpen((open) => !open)}
                  className="flex size-10 items-center justify-center rounded-full"
                >
                  <User aria-hidden="true" className="size-5" />
                </Button>
                {menuOpen && (
                  <div
                    id="account-menu"
                    className="absolute right-0 z-50 mt-4 w-72 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900"
                  >
                    <div className="border-b border-slate-200 px-4 py-4 dark:border-slate-700">
                      <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">
                        {user.name || "Your account"}
                      </p>
                      {user.email && (
                        <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
                          {user.email}
                        </p>
                      )}
                    </div>
                    <nav
                      aria-label="Account menu"
                      className="space-y-1 p-2 text-sm"
                    >
                      {user.role === "admin" && (
                        <AccountMenuLink
                          href="/admin"
                          icon={<LayoutDashboard aria-hidden="true" />}
                          onClick={() => setMenuOpen(false)}
                        >
                          Admin
                        </AccountMenuLink>
                      )}
                      <AccountMenuLink
                        href="/dashboard"
                        icon={<LayoutDashboard aria-hidden="true" />}
                        onClick={() => setMenuOpen(false)}
                      >
                        Dashboard
                      </AccountMenuLink>
                      <AccountMenuLink
                        href="/dashboard/uploads"
                        icon={<Music2 aria-hidden="true" />}
                        onClick={() => setMenuOpen(false)}
                      >
                        Manage uploads
                      </AccountMenuLink>
                      <AccountMenuLink
                        href="/dashboard/upload"
                        icon={<Upload aria-hidden="true" />}
                        onClick={() => setMenuOpen(false)}
                      >
                        Upload a sound
                      </AccountMenuLink>
                      <AccountMenuLink
                        href="/dashboard/settings"
                        icon={<Settings aria-hidden="true" />}
                        onClick={() => setMenuOpen(false)}
                      >
                        Account settings
                      </AccountMenuLink>
                      <AccountMenuLink
                        href="/search"
                        icon={<Music2 aria-hidden="true" />}
                        onClick={() => setMenuOpen(false)}
                      >
                        Public library
                      </AccountMenuLink>
                    </nav>
                    <div className="border-t border-slate-200 p-2 dark:border-slate-700">
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await caches.delete("dhonn-app-v1")
                          } catch (error) {
                            console.error("Could not clear cached account pages.", error)
                          }
                          await signOut({ redirectTo: "/" })
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-rose-600 transition hover:bg-rose-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500 dark:text-rose-400 dark:hover:bg-rose-950/40"
                      >
                        <LogOut aria-hidden="true" className="size-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className={`max-w-28 overflow-hidden rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold whitespace-nowrap text-white transition-[max-width,opacity,padding,margin,background-color,visibility] duration-500 hover:bg-sky-600 motion-reduce:transition-none dark:bg-white dark:text-slate-950 dark:hover:bg-sky-200 ${ISLAND_EASE} ${
                  scrolled
                    ? "max-md:pointer-events-none max-md:invisible max-md:-ml-2 max-md:max-w-0 max-md:px-0 max-md:opacity-0"
                    : ""
                }`}
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>

      <nav
        aria-label="Mobile navigation"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/80 bg-white/95 px-2 pt-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden dark:border-slate-800 dark:bg-slate-950/95"
      >
        <div className="mx-auto flex max-w-lg items-center justify-around">
          <MobileNavLink
            href="/"
            label="Home"
            icon={<Home aria-hidden="true" />}
            active={pathname === "/"}
          />
          <MobileNavLink
            href="/featured"
            label="Featured"
            icon={<Sparkles aria-hidden="true" />}
            active={pathname === "/featured"}
          />
          <MobileNavLink
            href="/category"
            label="Categories"
            icon={<Grid2X2 aria-hidden="true" />}
            active={
              pathname === "/category" || pathname.startsWith("/category/")
            }
          />
          <MobileNavLink
            href="/search"
            label="Explore"
            icon={<Compass aria-hidden="true" />}
            active={pathname === "/search"}
          />
          <MobileNavLink
            href={user ? "/dashboard" : "/login"}
            label={user ? "Library" : "Sign in"}
            icon={
              user ? (
                <Library aria-hidden="true" />
              ) : (
                <CircleUserRound aria-hidden="true" />
              )
            }
            active={
              user
                ? pathname.startsWith("/dashboard")
                : pathname === "/login" || pathname === "/register"
            }
          />
        </div>
      </nav>
    </>
  )
}

function MobileNavLink({
  active,
  href,
  icon,
  label,
}: {
  active: boolean
  href: string
  icon: React.ReactNode
  label: string
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-1 py-1.5 text-[0.65rem] font-medium transition ${
        active
          ? "text-sky-600 dark:text-sky-400"
          : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
      }`}
    >
      <span className="flex size-6 items-center justify-center [&_svg]:size-5">
        {icon}
      </span>
      <span className="truncate">{label}</span>
    </Link>
  )
}

function AccountMenuLink({
  children,
  href,
  icon,
  onClick,
}: {
  children: React.ReactNode
  href: string
  icon: React.ReactNode
  onClick: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
    >
      <span className="flex size-4 items-center justify-center">{icon}</span>
      {children}
    </Link>
  )
}
