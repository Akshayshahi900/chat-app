import Link from "next/link"

export default function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-6xl px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Zing All rights reserved.
        </p>
        <div className="text-sm text-muted-foreground flex items-center gap-4">
          {/* <Link href="/profile" className="hover:text-foreground transition-colors">
            Profile
          </Link> */}
          <Link href="/signup" className="hover:text-foreground transition-colors">
            Sign up
          </Link>
          <Link href="/login" className="hover:text-foreground transition-colors">
            Log in
          </Link>
        </div>
      </div>
    </footer>
  )
}
