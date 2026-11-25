"use client"

import Link from "next/link"
import { BookOpen, ClipboardCheck, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import PageHeader from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { BackendAlert, DbHint, LoadingRow } from "@/components/dashboard/status"
import { useRequireAuth } from "@/lib/auth-context"
import { useTeacherScope } from "@/hooks/use-teacher-scope"
import { SESSIONS } from "@/lib/constants"
import { cn, docId } from "@/lib/utils"

/** Small seat-usage bar — enrolled vs the class's capacity. */
function CapacityBar({ used, limit }) {
  const pct = limit ? Math.min(100, Math.round((used / limit) * 100)) : 0
  const full = used >= limit
  return (
    <div className="mt-3">
      <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground">
        <span>
          {used} of {limit} seats
        </span>
        <span className={full ? "text-amber-600 dark:text-amber-400" : ""}>
          {full ? "Full" : `${limit - used} free`}
        </span>
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            full ? "bg-amber-500" : "bg-primary",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

/** Session accent matched by name — Mongo ids never equal the static ids. */
function sessionMeta(sessionName) {
  return (
    SESSIONS.find((session) => session.name === sessionName) || {
      ring: "ring-transparent",
      medium: "",
    }
  )
}

export default function TeacherClassesPage() {
  const { user } = useRequireAuth(["teacher"])
  const { classes, countFor, loading, error, refetch } = useTeacherScope(user)

  // Group the teacher's classes under their sessions, in school order.
  const groups = SESSIONS.map((session) => ({
    session,
    classes: classes.filter((klass) => klass.sessionName === session.name),
  })).filter((group) => group.classes.length > 0)

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Teacher Portal"
        title="My Classes"
        description="Classes where the admin office appointed you as class teacher — session, medium, seat usage and quick links to the roster and attendance register."
        actions={
          <Button
            variant="outline"
            render={<Link href="/dashboard/teacher/students" />}
          >
            <Users className="size-4" /> My students
          </Button>
        }
      />

      <BackendAlert error={error} />

      {loading ? (
        <LoadingRow label="Loading your classes…" />
      ) : classes.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No class assigned yet"
          description="The admin office assigns class teachers under Sessions & Classes in the Admin dashboard. Your class, session and roster appear here as soon as it is assigned."
          actionLabel="Back to overview"
          actionHref="/dashboard/teacher"
        />
      ) : (
        groups.map(({ session, classes: groupClasses }) => (
          <section key={session.name} className="space-y-4">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <h2 className="font-heading text-lg font-extrabold tracking-tight">
                {session.name}
              </h2>
              <span className="rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                {session.medium} · {session.period}
              </span>
              <span className="text-xs text-muted-foreground">
                {groupClasses.length} class
                {groupClasses.length === 1 ? "" : "es"}
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {groupClasses.map((klass) => {
                const enrolled = countFor(klass.id)
                const meta = sessionMeta(klass.sessionName)
                return (
                  <div
                    key={docId(klass)}
                    className={cn(
                      "card-hover rounded-2xl border border-border bg-background p-4 ring-4",
                      meta.ring,
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-heading text-base font-bold tracking-tight">
                          {klass.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {klass.medium}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                        {enrolled} students
                      </span>
                    </div>

                    <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Users className="size-3.5" />
                      Class teacher:{" "}
                      <span className="font-medium text-foreground">
                        {klass.classTeacherName || "—"}
                      </span>
                      {String(klass.classTeacherId) === String(docId(user)) && (
                        <span className="rounded-full bg-emerald-500/10 px-1.5 py-px text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                          you
                        </span>
                      )}
                    </p>

                    <CapacityBar used={enrolled} limit={klass.capacity || 30} />

                    <div className="mt-4 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        render={
                          <Link
                            href={`/dashboard/teacher/students?class=${docId(klass)}`}
                          />
                        }
                      >
                        <Users className="size-3.5" /> Roster
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="flex-1"
                        render={<Link href="/dashboard/teacher/attendance" />}
                      >
                        <ClipboardCheck className="size-3.5" /> Attendance
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        ))
      )}

      {!loading && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card px-5 py-3.5 text-sm">
          <span className="flex items-center gap-2 text-muted-foreground">
            <BookOpen className="size-4 text-primary" />
            <strong className="font-heading font-extrabold text-foreground">
              {classes.length}
            </strong>
            assigned class{classes.length === 1 ? "" : "es"} ·{" "}
            <strong className="font-heading font-extrabold text-foreground">
              {classes.reduce((total, klass) => total + countFor(klass.id), 0)}
            </strong>{" "}
            students
          </span>
          <span className="text-xs text-muted-foreground">
            Class lists are maintained by the admin office.
          </span>
        </div>
      )}

      {!loading && !error && <DbHint />}
    </div>
  )
}
