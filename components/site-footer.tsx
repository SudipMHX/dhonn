import Link from "next/link"
import { Volume2 } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="hidden md:block mt-20 border-t border-border/80 bg-card/40 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2"
              aria-label="dhonn. home"
            >
              <div className="flex size-7 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-2xs">
                <Volume2 className="size-3.5" strokeWidth={2.5} />
              </div>
              <span className="font-heading text-base font-bold tracking-tight text-foreground">
                dhonn<span className="text-indigo-600 dark:text-indigo-400">.</span>
              </span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Curated short audio for streams, creators, and conversations.
            </p>
          </div>

          <nav
            aria-label="Footer navigation"
            className="flex flex-wrap gap-x-6 gap-y-2.5 text-xs font-medium text-muted-foreground"
          >
            <Link
              href="/about"
              className="transition-colors hover:text-foreground"
            >
              About
            </Link>
            <Link
              href="/category"
              className="transition-colors hover:text-foreground"
            >
              Categories
            </Link>
            <Link
              href="/featured"
              className="transition-colors hover:text-foreground"
            >
              Featured
            </Link>
            <Link
              href="/contact"
              className="transition-colors hover:text-foreground"
            >
              Contact
            </Link>
            <Link
              href="/privacy"
              className="transition-colors hover:text-foreground"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="transition-colors hover:text-foreground"
            >
              Terms of Service
            </Link>
            <Link
              href="/report"
              className="transition-colors hover:text-foreground"
            >
              Copyright &amp; Reports
            </Link>
          </nav>
        </div>

        <div className="mt-8 border-t border-border/50 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground/80">
          <p>© {new Date().getFullYear()} dhonn. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            <span>Built for audio enthusiasts &amp; creators</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
