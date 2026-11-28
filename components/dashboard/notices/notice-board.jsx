"use client"

import { CalendarDays, Megaphone, ShieldAlert, Sparkles } from "lucide-react"

import { BackendAlert, LoadingRow } from "@/components/dashboard/status"
import { StatusBadge } from "@/components/shared/role-badge"
import { EmptyState } from "@/components/shared/empty-state"
import { cn } from "@/lib/utils"
import { NOTICE_AUDIENCE_LABELS, NOTICE_PRIORITY_LABELS } from "@/lib/constants"

/** Left accent for a priority — urgent reads loud, normal stays calm. */
const PRIORITY_ACCENT = {
  urgent: "border-l-rose-500",
  important: "border-l-amber-500",
  normal: "border-l-primary",
}

const PRIORITY_ICON = {
  urgent: ShieldAlert,
  important: Sparkles,
  normal: Megaphone,
}

/**
 * Read-only notice board shared by the Principal, Teacher and Student
 * dashboards — the server has already filtered the list to what the role
 * may see, so this only renders.
 *
 * Pass the result of `useApi("/api/notices?…")` as `query`.
 */
export function NoticeBoard({ query, emptyTitle, emptyText }) {
  const notices = query.data?.items || []
  const loading = query.loading
  const error = query.error

  if (error) return <BackendAlert error={error} />

  if (loading && !query.data) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-2xl border border-border bg-card"
          />
        ))}
        <LoadingRow label="Loading notices…" />
      </div>
    )
  }

  if (!notices.length) {
    return (
      <EmptyState
        icon={Megaphone}
        title={emptyTitle || "No notices right now"}
        description={
          emptyText ||
          "Announcements published by the admin office will appear here."
        }
      />
    )
  }

  return (
    <div className="space-y-4">
      {notices.map((notice) => {
        const Icon = PRIORITY_ICON[notice.priority] || Megaphone
        return (
          <article
            key={notice.id || notice._id}
            className={cn(
              "rounded-2xl border border-border border-l-4 bg-card p-5",
              PRIORITY_ACCENT[notice.priority] || PRIORITY_ACCENT.normal,
            )}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg",
                    notice.priority === "urgent"
                      ? "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400"
                      : notice.priority === "important"
                        ? "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
                        : "bg-primary/10 text-primary",
                  )}
                >
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0">
                  <h2 className="font-heading text-base font-extrabold tracking-tight">
                    {notice.title}
                  </h2>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="size-3.5" />
                      {notice.date || "—"}
                    </span>
                    {notice.createdByName && (
                      <span>By {notice.createdByName}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <StatusBadge
                  status={
                    notice.audience === "students"
                      ? "active"
                      : notice.audience === "teachers"
                        ? "teacher"
                        : notice.audience === "staff"
                          ? "admin"
                          : "principal"
                  }
                  label={NOTICE_AUDIENCE_LABELS[notice.audience]}
                />
                {notice.priority !== "normal" && (
                  <StatusBadge
                    status={notice.priority === "urgent" ? "absent" : "late"}
                    label={NOTICE_PRIORITY_LABELS[notice.priority]}
                  />
                )}
              </div>
            </div>

            <p className="mt-3 whitespace-pre-line pl-11 text-sm leading-relaxed text-muted-foreground">
              {notice.body}
            </p>
          </article>
        )
      })}
    </div>
  )
}

export default NoticeBoard
