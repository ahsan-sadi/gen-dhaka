import Link from "next/link"
import { GraduationCap } from "lucide-react"
import { cn } from "@/lib/utils"

/** Brand mark + wordmark — same styling is reused on every page (incl. navbar). */
export function Logo({ className, size = "md", href = "/", compact = false }) {
  const markSize = size === "lg" ? "size-11" : "size-9"
  const textSize = size === "lg" ? "text-2xl" : "text-xl"

  return (
    <Link
      href={href}
      className={cn("group flex items-center gap-2.5 font-heading", className)}
      aria-label="BAFWWA GEN DHAKA home"
    >
      <span
        className={cn(
          "flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-white shadow-lg shadow-indigo-500/25 transition-transform group-hover:-rotate-6",
          markSize
        )}
      >
        <GraduationCap className="size-1/2" strokeWidth={2.25} />
      </span>
      {!compact && (
        <span
          className={cn(
            "leading-tight font-extrabold tracking-tight text-foreground",
            textSize
          )}
        >
          BAFWWA <span className="text-gradient">GEN DHAKA</span>
        </span>
      )}
    </Link>
  )
}

export default Logo
