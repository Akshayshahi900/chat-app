"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

type Theme = "light" | "dark"

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const [theme, setTheme] = useState<Theme>("dark")

  useEffect(() => {
    setMounted(true)
    // Initialize from localStorage or system preference, default to dark
    const stored = (typeof window !== "undefined" && localStorage.getItem("theme")) as Theme | null
    const prefersDark = typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches
    const next: Theme = stored ?? (prefersDark ? "dark" : "dark")
    applyTheme(next)
  }, [])

  function applyTheme(next: Theme) {
    setTheme(next)
    if (typeof document !== "undefined") {
      const root = document.documentElement
      root.classList.toggle("dark", next === "dark")
      try {
        localStorage.setItem("theme", next)
      } catch {}
    }
  }

  if (!mounted) {
    // Avoid hydration mismatch
    return (
      <Button variant="ghost" size="icon" aria-label="Toggle theme" className="text-foreground/80" disabled>
        <span className="sr-only">{"Toggle theme"}</span>
        {/* placeholder icon box */}
        <div className="h-5 w-5 rounded-sm border border-border" />
      </Button>
    )
  }

  const nextTheme: Theme = theme === "dark" ? "light" : "dark"

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      aria-pressed={theme === "dark"}
      title={`Switch to ${nextTheme} mode`}
      className="text-foreground/90"
      onClick={() => applyTheme(nextTheme)}
    >
      <span className="sr-only">{"Toggle theme"}</span>
      {theme === "dark" ? <SunIcon /> : <MoonIcon />}
    </Button>
  )
}

function SunIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" role="img" aria-label="Light mode" {...props}>
      <circle cx="12" cy="12" r="4" fill="currentColor" />
      <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <line x1="12" y1="2" x2="12" y2="5" />
        <line x1="12" y1="19" x2="12" y2="22" />
        <line x1="22" y1="12" x2="19" y2="12" />
        <line x1="5" y1="12" x2="2" y2="12" />
        <line x1="18.36" y1="5.64" x2="16.24" y2="7.76" />
        <line x1="7.76" y1="16.24" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="18.36" x2="16.24" y2="16.24" />
        <line x1="7.76" y1="7.76" x2="5.64" y2="5.64" />
      </g>
    </svg>
  )
}

function MoonIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" role="img" aria-label="Dark mode" {...props}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="currentColor" />
    </svg>
  )
}
