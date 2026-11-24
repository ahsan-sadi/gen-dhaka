import Link from "next/link"
import { Compass, Home, Search } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background px-4 py-16 text-center">
      <p className="text-gradient font-heading text-7xl font-extrabold tracking-tight sm:text-8xl">
        404
      </p>
      <h1 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl">
        Page not found
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
        The page you are looking for does not exist or may have been moved.
        Let&apos;s get you back to the BAFWWA GEN DHAKA portal.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button size="lg" render={<Link href="/" />}>
          <Home className="size-4" /> Back to Home
        </Button>
        <Button size="lg" variant="outline" render={<Link href="/sign-in" />}>
          <Search className="size-4" /> Portal Login
        </Button>
      </div>

      <p className="mt-6 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Compass className="size-3.5" />
        Or explore{" "}
        <Link
          href="/about"
          className="font-medium text-primary hover:underline"
        >
          how BAFWWA GEN DHAKA works
        </Link>
      </p>
    </div>
  )
}
