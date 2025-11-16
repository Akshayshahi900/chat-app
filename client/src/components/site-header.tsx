"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import ThemeToggle from "@/components/theme-toggle"
import Logo from "./ui/Logo"

export default function SiteHeader() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2">
          {/* <span aria-hidden className="h-2.5 w-2.5 rounded-sm bg-primary" /> */}
          {/* <span className="font-semibold tracking-tight">Realtime Chat</span> */}
          <Logo isCollapsed={false}/>
        </Link>

        <nav aria-label="Main" className="flex items-center gap-2">
          {/* <Button asChild variant="ghost">
            <Link href="/profile">Profile</Link>
          </Button> */}
          <Button asChild variant="ghost">
            <Link href="/signup">Sign up</Link>
          </Button>
          <Button asChild>
            <Link href="/login">Log in</Link>
          </Button>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  )
}
