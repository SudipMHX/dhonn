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
  X,
} from "lucide-react"

import { ThemeToggle } from "@/components/theme-toggle"

type HeaderUser = {
  name?: string | null
  email?: string | null
  role: "user" | "admin"
}

export function SiteHeader({ user }: { user: HeaderUser | null }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const pathname = usePathname()

  const isDashboardRoute =
    pathname.startsWith("/dashboard") || pathname.startsWith("/admin")

  // Close search and menus on navigation
  const prevPathnameRef = useRef(pathname)
  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname
      const timer = setTimeout(() => {
        setMobileSearchOpen(false)
        setMenuOpen(false)
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [pathname])

  // Focus search input when mobile search is opened
  useEffect(() => {
    if (mobileSearchOpen) {
      searchInputRef.current?.focus()
    }
  }, [mobileSearchOpen])

  // Close account menu or search when clicking outside or pressing Escape
  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (menuOpen && !menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false)
        setMobileSearchOpen(false)
      }
    }

    document.addEventListener("pointerdown", handlePointerDown)
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [menuOpen, mobileSearchOpen])

  return (
    <>
      <header
        className={`pointer-events-none sticky top-0 z-40 w-full px-2.5 pt-2 sm:px-6 sm:pt-2.5 ${isDashboardRoute && "hidden"}`}
      >
        <div className="dynamic-island pointer-events-auto mx-auto flex w-full items-center justify-between gap-2 backdrop-blur-[5px] sm:gap-4">
          {/* Brand Logo */}
          <Link
            href="/"
            className="group flex shrink-0 touch-manipulation items-center transition-opacity hover:opacity-90 active:scale-95"
            aria-label="dhonn. home"
          >
            <span className="font-heading text-base font-bold tracking-tight text-foreground sm:text-lg md:text-xl">
              dhonn
              <span className="text-indigo-600 dark:text-indigo-400">.</span>
            </span>
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
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
            {/* Desktop Search */}
            <form
              action="/search"
              role="search"
              className="group relative hidden items-center text-xs md:flex"
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
                className="h-8 w-32 rounded-full border border-border/70 bg-card/40 pr-7 pl-8 text-xs text-foreground transition-all placeholder:text-muted-foreground focus:w-48 focus:border-indigo-500/60 focus:bg-background focus:ring-2 focus:ring-indigo-500/15 focus:outline-none lg:w-40 focus:dark:bg-inherit"
              />

              <kbd className="pointer-events-none absolute right-2.5 hidden rounded border border-border/70 bg-muted/50 px-1 py-0.5 font-mono text-[9px] text-muted-foreground select-none lg:inline-block">
                /
              </kbd>
            </form>

            {/* Mobile Search Toggle */}
            <button
              type="button"
              aria-label={
                mobileSearchOpen ? "Close search bar" : "Search sounds"
              }
              aria-expanded={mobileSearchOpen}
              onClick={() => setMobileSearchOpen((open) => !open)}
              className={`flex size-8 touch-manipulation items-center justify-center rounded-xl border text-muted-foreground transition-all active:scale-95 md:hidden ${
                mobileSearchOpen
                  ? "border-indigo-500 bg-secondary text-foreground ring-2 ring-indigo-500/20"
                  : "border-border/70 bg-card/60 hover:border-border hover:bg-secondary hover:text-foreground"
              }`}
            >
              <Search aria-hidden="true" className="size-3.5" />
            </button>

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
                  className={`flex size-8 touch-manipulation items-center justify-center rounded-xl border text-foreground transition-all active:scale-95 ${
                    menuOpen
                      ? "border-indigo-500 bg-secondary ring-2 ring-indigo-500/20"
                      : "border-border/70 bg-card/60 hover:border-border hover:bg-secondary"
                  }`}
                >
                  <User aria-hidden="true" className="size-3.5 sm:size-4" />
                </button>

                {menuOpen && (
                  <div
                    id="account-menu"
                    className="absolute right-0 z-50 mt-2 w-64 max-w-[calc(100vw-1.5rem)] animate-in overflow-hidden rounded-2xl border border-border/80 bg-card p-1.5 shadow-xl shadow-black/10 backdrop-blur-xl duration-150 fade-in-0 zoom-in-95"
                  >
                    <div className="border-b border-border/60 px-3 py-2.5">
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
                        className="flex w-full touch-manipulation items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium text-rose-600 transition hover:bg-rose-50 active:scale-95 dark:text-rose-400 dark:hover:bg-rose-950/40"
                      >
                        <LogOut aria-hidden="true" className="size-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Link
                  href="/login"
                  className="flex touch-manipulation items-center rounded-xl border border-border/70 bg-card/60 px-2.5 py-1 text-xs font-semibold text-foreground transition-all hover:border-border hover:bg-secondary active:scale-95 md:rounded-full md:border-transparent md:bg-transparent md:px-3 md:hover:bg-secondary/80"
                >
                  Sign in
                </Link>

                <Link
                  href="/register"
                  className="hidden rounded-full bg-indigo-600 px-3.5 py-1 text-xs font-semibold text-white shadow-xs shadow-indigo-600/30 transition-all hover:bg-indigo-500 active:scale-95 active:bg-indigo-700 sm:inline-flex dark:bg-indigo-600 dark:hover:bg-indigo-500"
                >
                  Get started
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Expandable Mobile Search Drawer */}
        {mobileSearchOpen && (
          <div className="pointer-events-auto mx-auto mt-2 w-full max-w-md animate-in duration-150 fade-in-0 slide-in-from-top-2 md:hidden">
            <form
              action="/search"
              role="search"
              onSubmit={() => setMobileSearchOpen(false)}
              className="relative flex items-center"
            >
              <label htmlFor="mobile-site-search" className="sr-only">
                Search sounds
              </label>

              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3.5 size-4 text-muted-foreground"
              />

              <input
                ref={searchInputRef}
                id="mobile-site-search"
                name="q"
                type="search"
                placeholder="Search sounds, tags..."
                autoComplete="off"
                className="h-10 w-full rounded-2xl border border-indigo-500/50 bg-background/95 pr-10 pl-10 text-xs text-foreground shadow-xl shadow-black/10 backdrop-blur-2xl transition-all placeholder:text-muted-foreground focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
              />

              <button
                type="button"
                onClick={() => setMobileSearchOpen(false)}
                aria-label="Close search input"
                className="absolute right-2 flex size-7 items-center justify-center rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground active:scale-90"
              >
                <X className="size-3.5" />
              </button>
            </form>
          </div>
        )}
      </header>

      {/* Mobile Navigation Dock */}
      <nav
        aria-label="Mobile navigation"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-background/90 px-2 pt-1.5 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] backdrop-blur-xl md:hidden"
      >
        <div className="mx-auto flex max-w-md items-center justify-around">
          <MobileNavLink
            href="/"
            label="Home"
            icon={<Home className="size-4.5" />}
            active={pathname === "/"}
          />

          <MobileNavLink
            href="/featured"
            label="Featured"
            icon={<Sparkles className="size-4.5" />}
            active={pathname === "/featured"}
          />

          <MobileNavLink
            href="/category"
            label="Categories"
            icon={<Grid2X2 className="size-4.5" />}
            active={
              pathname === "/category" || pathname.startsWith("/category/")
            }
          />

          <MobileNavLink
            href="/search"
            label="Explore"
            icon={<Compass className="size-4.5" />}
            active={pathname === "/search"}
          />

          <MobileNavLink
            href={user ? "/dashboard" : "/login"}
            label={user ? "Library" : "Account"}
            icon={
              user ? (
                <Library className="size-4.5" />
              ) : (
                <User className="size-4.5" />
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
      className={`touch-manipulation rounded-full px-3 py-1 text-xs font-medium transition-all duration-200 active:scale-95 ${
        active
          ? "bg-secondary font-semibold text-foreground shadow-2xs"
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
      className={`flex min-h-[44px] min-w-0 flex-1 touch-manipulation flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1 text-[10px] font-medium transition-all active:scale-95 ${
        active
          ? "font-semibold text-indigo-600 dark:text-indigo-400"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      <span
        className={`flex size-7 items-center justify-center rounded-lg transition-all ${
          active
            ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400"
            : ""
        }`}
      >
        {icon}
      </span>

      <span className="max-w-full truncate">{label}</span>
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
