"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import {
  Compass,
  Grid2X2,
  Home,
  LayoutDashboard,
  Library,
  LogOut,
  Music,
  Search,
  Settings,
  Sparkles,
  Upload,
  User,
  Volume2,
} from "lucide-react"

import { ThemeToggle } from "@/components/theme-toggle"

type HeaderUser = {
  name?: string | null
  email?: string | null
  role: "user" | "admin"
}

export function SiteHeader({ user }: { user: HeaderUser | null }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  useEffect(() => {
    let frame = 0

    function update() {
      frame = 0
      const y = window.scrollY
      setScrolled((prev) => (y > 20 ? true : y < 8 ? false : prev))
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
      <header className="sticky top-0 z-40 w-full px-3 pt-3 pb-1 transition-all duration-300 sm:px-6">
        <div
          className={`mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-2xl border px-3.5 py-2.5 transition-all duration-300 ${
            scrolled
              ? "border-border/80 bg-background/85 shadow-lg shadow-black/[0.03] backdrop-blur-xl dark:shadow-black/25"
              : "border-border/60 bg-background/70 backdrop-blur-md"
          }`}
        >
          {/* Brand Logo */}
          <Link
            href="/"
            className="group flex shrink-0 items-center gap-2.5 transition-opacity hover:opacity-90"
            aria-label="dhonn. home"
          >
            <div className="flex size-8 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs shadow-indigo-600/30 transition-transform duration-200 group-hover:scale-105">
              <Volume2 className="size-4" strokeWidth={2.5} />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-heading text-lg font-bold tracking-tight text-foreground">
                dhonn
              </span>
              <span className="size-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav
            aria-label="Main navigation"
            className="hidden items-center gap-1 text-sm font-medium text-muted-foreground md:flex"
          >
            <NavLink href="/featured" active={pathname === "/featured"}>
              Featured
            </NavLink>
            <NavLink
              href="/category"
              active={
                pathname === "/category" || pathname.startsWith("/category/")
              }
            >
              Categories
            </NavLink>
            <NavLink href="/search" active={pathname === "/search"}>
              Explore
            </NavLink>
            <NavLink
              href="/dashboard"
              active={pathname.startsWith("/dashboard")}
            >
              Library
            </NavLink>
          </nav>

          {/* Right Actions */}
          <div className="flex shrink-0 items-center gap-2.5">
            <form
              action="/search"
              role="search"
              className="group relative hidden items-center md:flex"
            >
              <label htmlFor="site-search" className="sr-only">
                Search sounds
              </label>
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 size-4 text-muted-foreground transition-colors group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400"
              />
              <input
                id="site-search"
                name="q"
                type="search"
                placeholder="Search sounds..."
                className="h-9 w-36 rounded-xl border border-input bg-card/60 pr-8 pl-9 text-xs text-foreground transition-all placeholder:text-muted-foreground focus:w-56 focus:border-indigo-500 focus:bg-card focus:ring-2 focus:ring-indigo-500/20 focus:outline-none lg:w-48"
              />
              <kbd className="pointer-events-none absolute right-2.5 hidden select-none rounded border border-border bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground lg:inline-block">
                /
              </kbd>
            </form>

            <ThemeToggle />

            {user ? (
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  aria-label={
                    menuOpen ? "Close account menu" : "Open account menu"
                  }
                  aria-haspopup="true"
                  aria-expanded={menuOpen}
                  aria-controls="account-menu"
                  onClick={() => setMenuOpen((open) => !open)}
                  className={`flex size-9 items-center justify-center rounded-xl border text-foreground transition-all ${
                    menuOpen
                      ? "border-indigo-500 bg-secondary ring-2 ring-indigo-500/20"
                      : "border-border bg-card hover:bg-secondary hover:border-border/80"
                  }`}
                >
                  <User aria-hidden="true" className="size-4" />
                </button>

                {menuOpen && (
                  <div
                    id="account-menu"
                    className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-border/80 bg-card p-1.5 shadow-xl shadow-black/10 backdrop-blur-xl animate-in fade-in-0 zoom-in-95 duration-150"
                  >
                    <div className="px-3 py-2.5 border-b border-border/60">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {user.name || "Your account"}
                      </p>
                      {user.email && (
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      )}
                      {user.role === "admin" && (
                        <span className="mt-1.5 inline-block rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-indigo-700 uppercase dark:bg-indigo-950/60 dark:text-indigo-300">
                          Administrator
                        </span>
                      )}
                    </div>

                    <nav
                      aria-label="Account menu"
                      className="space-y-0.5 py-1 text-xs font-medium"
                    >
                      {user.role === "admin" && (
                        <AccountMenuLink
                          href="/admin"
                          icon={<LayoutDashboard className="size-4" />}
                          onClick={() => setMenuOpen(false)}
                        >
                          Admin Console
                        </AccountMenuLink>
                      )}
                      <AccountMenuLink
                        href="/dashboard"
                        icon={<LayoutDashboard className="size-4" />}
                        onClick={() => setMenuOpen(false)}
                      >
                        Dashboard Overview
                      </AccountMenuLink>
                      <AccountMenuLink
                        href="/dashboard/upload"
                        icon={<Upload className="size-4" />}
                        onClick={() => setMenuOpen(false)}
                      >
                        Upload Sound
                      </AccountMenuLink>
                      <AccountMenuLink
                        href="/dashboard/uploads"
                        icon={<Music className="size-4" />}
                        onClick={() => setMenuOpen(false)}
                      >
                        Manage Uploads
                      </AccountMenuLink>
                      <AccountMenuLink
                        href="/dashboard/settings"
                        icon={<Settings className="size-4" />}
                        onClick={() => setMenuOpen(false)}
                      >
                        Account Settings
                      </AccountMenuLink>
                    </nav>

                    <div className="border-t border-border/60 pt-1">
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await caches.delete("dhonn-app-v1")
                          } catch (error) {
                            console.error(
                              "Could not clear cached account pages.",
                              error
                            )
                          }
                          await signOut({ redirectTo: "/" })
                        }}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium text-rose-600 transition hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
                      >
                        <LogOut aria-hidden="true" className="size-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="rounded-xl px-3.5 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-secondary"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs shadow-indigo-600/30 transition-all hover:bg-indigo-500 active:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500"
                >
                  Get started
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Navigation Dock */}
      <nav
        aria-label="Mobile navigation"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-background/90 px-3 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] backdrop-blur-xl md:hidden"
      >
        <div className="mx-auto flex max-w-md items-center justify-around">
          <MobileNavLink
            href="/"
            label="Home"
            icon={<Home className="size-5" />}
            active={pathname === "/"}
          />
          <MobileNavLink
            href="/featured"
            label="Featured"
            icon={<Sparkles className="size-5" />}
            active={pathname === "/featured"}
          />
          <MobileNavLink
            href="/category"
            label="Categories"
            icon={<Grid2X2 className="size-5" />}
            active={
              pathname === "/category" || pathname.startsWith("/category/")
            }
          />
          <MobileNavLink
            href="/search"
            label="Explore"
            icon={<Compass className="size-5" />}
            active={pathname === "/search"}
          />
          <MobileNavLink
            href={user ? "/dashboard" : "/login"}
            label={user ? "Library" : "Account"}
            icon={
              user ? (
                <Library className="size-5" />
              ) : (
                <User className="size-5" />
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

function NavLink({
  children,
  href,
  active,
}: {
  children: React.ReactNode
  href: string
  active: boolean
}) {
  return (
    <Link
      href={href}
      className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
        active
          ? "bg-secondary text-foreground font-semibold shadow-2xs"
          : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
      }`}
    >
      {children}
    </Link>
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
      className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-1 py-1 text-[11px] font-medium transition-all ${
        active
          ? "text-indigo-600 dark:text-indigo-400 font-semibold"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      <span
        className={`flex size-8 items-center justify-center rounded-xl transition-all ${
          active ? "bg-indigo-50 dark:bg-indigo-950/50" : ""
        }`}
      >
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
      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-foreground/90 transition-colors hover:bg-secondary hover:text-foreground"
    >
      <span className="text-muted-foreground">{icon}</span>
      <span>{children}</span>
    </Link>
  )
}
