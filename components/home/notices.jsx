import { CalendarDays, Megaphone, ShieldAlert, Sparkles } from "lucide-react"

import {
  formatDate,
  NOTICE_PRIORITY_LABELS,
} from "@/lib/constants"

/* Public landing section listing the latest school-wide notices. Data comes
   from GET /api/notices/public (no auth), which only exposes audience "all"
   notices without class targeting — the Admin dashboard stays the single
   source of truth for what the website announces. */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

/* Left accent for a priority — urgent reads loud, normal stays calm. */
const PRIORITY_ACCENT = {
  urgent: "border-l-rose-500",
  important: "border-l-amber-500",
  normal: "border-l-primary",
}

const PRIORITY_BADGE = {
  urgent: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  important: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  normal: "bg-primary/10 text-primary",
}

const PRIORITY_ICON = {
  urgent: ShieldAlert,
  important: Sparkles,
  normal: Megaphone,
}

async function loadNotices() {
  try {
    const response = await fetch(`${API_BASE}/api/notices/public`, {
      cache: "no-store",
    })
    if (!response.ok) return []
    const items = await response.json()
    return Array.isArray(items) ? items : []
  } catch {
    return []
  }
}

export async function Notices() {
  const notices = await loadNotices()

  /* Never break the landing page — hide the section when there is
     nothing to announce (API down or no public notices yet). */
  if (!notices.length) return null

  return (
    <section
      id="notices"
      className="section scroll-mt-20 border-b border-border"
    >
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Latest Notices</p>
          <h2 className="section-title mt-3">
            Important <span className="text-gradient">Notice</span>
          </h2>
          <p className="section-lead mt-4">
            School-wide announcements published by the Admin dashboard — the
            same notices families and staff see inside their portals.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {notices.map((notice) => {
            const Icon = PRIORITY_ICON[notice.priority] || Megaphone
            const badge =
              PRIORITY_BADGE[notice.priority] || PRIORITY_BADGE.normal
            const accent =
              PRIORITY_ACCENT[notice.priority] || PRIORITY_ACCENT.normal
            const body =
              notice.body.length > 160
                ? `${notice.body.slice(0, 160)}…`
                : notice.body

            return (
              <article
                key={notice.id}
                className={`card-hover flex h-full flex-col rounded-2xl border border-border border-l-4 bg-card p-5 ${accent}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${badge}`}
                  >
                    <Icon className="size-3" />
                    {NOTICE_PRIORITY_LABELS[notice.priority] || "Normal"}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <CalendarDays className="size-3" />
                    {formatDate(notice.date)}
                  </span>
                </div>

                <h3 className="mt-4 font-heading text-lg font-bold leading-snug">
                  {notice.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {body}
                </p>

                {notice.createdByName ? (
                  <p className="mt-4 border-t border-border pt-3 text-[11px] text-muted-foreground">
                    Posted by {notice.createdByName}
                  </p>
                ) : null}
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default Notices
