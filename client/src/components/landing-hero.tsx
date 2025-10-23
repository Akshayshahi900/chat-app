import Link from "next/link"
import { Button } from "@/components/ui/button"
// import Image from "next/image"
export default function LandingHero() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
      <div className="grid gap-8 md:grid-cols-2 md:gap-12 items-center">
        <div className="space-y-6">
          <h1 className="text-pretty text-4xl md:text-5xl font-semibold tracking-tight">
            Chat in real time. Simple. Secure. Fast.
          </h1>
          <p className="text-muted-foreground leading-relaxed md:text-lg">
            Connect instantly with friends. Low-latency rooms, media sharing, and presence – all in a
            clean, modern UI.
          </p>
          <div className="flex items-center gap-3">
            <Button asChild size="lg">
              <Link href="/login" aria-label="Go to login page to get started">
                Get started
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/signup">Create account</Link>
            </Button>
          </div>
          <ul className="grid gap-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-primary" />
              Search users
            </li>
            <li className="flex items-center gap-2">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-primary" />
              Seemless media and file sharing
            </li>
            <li className="flex items-center gap-2">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-primary" />
              Secure Messages
            </li>
          </ul>
        </div>

        <div aria-hidden className="rounded-lg border border-border bg-card p-6">
          {/* Image container */}
          <div className="h-64 w-full rounded-md bg-muted flex items-center justify-center  overflow-hidden">
            <img src="/image.png" alt="Chat mockup" className="w-full h-full" />
          </div>

          {/* Labels */}
          <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
            <div className="rounded-md bg-muted p-3 text-center">Rooms</div>
            <div className="rounded-md bg-muted p-3 text-center">Threads</div>
            <div className="rounded-md bg-muted p-3 text-center">Mentions</div>
          </div>
        </div>

      </div>
    </section>
  )
}
