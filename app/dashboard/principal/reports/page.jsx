"use client"

import Link from "next/link"
import {
  BarChart3,
  CalendarRange,
  GraduationCap,
  Printer,
  School,
  ShieldCheck,
  Users,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import PageHeader from "@/components/shared/page-header"
import { BackendAlert, DbHint, LoadingRow } from "@/components/dashboard/status"
import { useApi } from "@/hooks/use-api"
import { useRequireAuth } from "@/lib/auth-context"
import {
  ROLE_LABELS,
  SESSIONS,
  STAFF_HEADCOUNT,
  STAFF_ROLES,
} from "@/lib/constants"
import { cn } from "@/lib/utils"

/** Generated-on timestamp for the printed copy. */
function generatedLabel() {
  try {
    return new Date().toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    })
  } catch {
    return new Date().toISOString().slice(0, 16).replace("T", " ")
  }
}

function SectionHead({ icon: Icon, title, note }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <div className="flex items-center gap-2">
          <Icon className="size-4 text-primary" />
          <h2 className="font-heading text-lg font-extrabold tracking-tight">
            {title}
          </h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{note}</p>
      </div>
    </div>
  )
}

function Bar({ value, limit, tone = "primary" }) {
  const pct = limit ? Math.min(100, Math.round((value / limit) * 100)) : 0
  const full = limit && value >= limit
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div
        className={cn(
          "h-full rounded-full",
          full
            ? "bg-amber-500"
            : tone === "violet"
              ? "bg-violet-500"
              : "bg-primary",
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

export default function PrincipalReportsPage() {
  const { user } = useRequireAuth(["principal"])

  const overviewQuery = useApi("/api/stats/overview")
  const staffStatsQuery = useApi("/api/staff/stats")
  const classesQuery = useApi("/api/classes")

  const loading =
    overviewQuery.loading || staffStatsQuery.loading || classesQuery.loading
  const error = overviewQuery.error || staffStatsQuery.error || classesQuery.error

  const overview = overviewQuery.data
  const staffStats = staffStatsQuery.data
  const classes = Array.isArray(classesQuery.data)
    ? classesQuery.data
    : (classesQuery.data?.classes ?? [])

  const students = overview?.students
  const staff = overview?.staff

  const enrolledFor = (className, sessionName) =>
    students?.byClass?.find(
      (item) =>
        item.className === className && item.sessionName === sessionName,
    )?.count ?? 0

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Office of the Principal"
        title="School Reports"
        description="Whole-school head-counts, staff composition and per-class enrollment — read-only figures assembled live from the school records."
        actions={
          <>
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="size-4" /> Print
            </Button>
            <Button render={<Link href="/dashboard/principal" />}>
              <BarChart3 className="size-4" /> Overview
            </Button>
          </>
        }
      />

      <BackendAlert error={error} />

      {/* --------------------------- totals strip -------------------------- */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl border border-border bg-card px-5 py-3.5 text-sm print:border-gray-400">
        <span className="flex items-center gap-2">
          <GraduationCap className="size-4 text-emerald-500" />
          <strong className="font-heading font-extrabold">
            {students?.total ?? "—"}
          </strong>
          <span className="text-muted-foreground">students</span>
        </span>
        <span className="flex items-center gap-2">
          <Users className="size-4 text-primary" />
          <strong className="font-heading font-extrabold">
            {staff?.total ?? "—"}
          </strong>
          <span className="text-muted-foreground">staff</span>
        </span>
        <span className="flex items-center gap-2">
          <CalendarRange className="size-4 text-violet-500" />
          <strong className="font-heading font-extrabold">
            {SESSIONS.length}
          </strong>
          <span className="text-muted-foreground">sessions</span>
        </span>
        <span className="flex items-center gap-2">
          <School className="size-4 text-sky-500" />
          <strong className="font-heading font-extrabold">
            {classes.length || "—"}
          </strong>
          <span className="text-muted-foreground">classes</span>
        </span>
        <span className="ml-auto text-xs text-muted-foreground">
          Generated {generatedLabel()}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ------------------------- staff report --------------------------- */}
        <section className="rounded-2xl border border-border bg-card p-5">
          <SectionHead
            icon={ShieldCheck}
            title="Staff composition"
            note="Fixed head-counts enforced by the admin dashboard. Support staff have no portal login."
          />

          <div className="mt-4 overflow-hidden rounded-xl border border-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Head-count</TableHead>
                  <TableHead className="w-40">Quota fill</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="ml-auto h-4 w-12 animate-pulse rounded bg-muted" />
                        </TableCell>
                        <TableCell>
                          <div className="h-2 w-full animate-pulse rounded-full bg-muted" />
                        </TableCell>
                      </TableRow>
                    ))
                  : STAFF_ROLES.map((role) => {
                      const value = staffStats?.[role] ?? staff?.[role] ?? 0
                      const quota = STAFF_HEADCOUNT[role]
                      return (
                        <TableRow key={role}>
                          <TableCell className="font-medium">
                            {ROLE_LABELS[role]}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="font-heading font-extrabold">
                              {value}
                            </span>
                            <span className="text-muted-foreground">
                              {" "}
                              / {quota}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Bar value={value} limit={quota} />
                          </TableCell>
                        </TableRow>
                      )
                    })}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
            <span>
              Active:{" "}
              <strong className="text-foreground">
                {staffStats?.active ?? "—"}
              </strong>
            </span>
            <span>
              Inactive:{" "}
              <strong className="text-foreground">
                {staffStats?.inactive ?? "—"}
              </strong>
            </span>
            <span>
              Students active:{" "}
              <strong className="text-foreground">
                {students?.active ?? "—"}
              </strong>
            </span>
            <span>
              Students inactive:{" "}
              <strong className="text-foreground">
                {students && students.total !== undefined
                  ? students.total - students.active
                  : "—"}
              </strong>
            </span>
          </div>
        </section>

        {/* ------------------------ session report -------------------------- */}
        <section className="rounded-2xl border border-border bg-card p-5">
          <SectionHead
            icon={CalendarRange}
            title="Enrollment by session"
            note="Live student counts per academic session, with each session's medium and period."
          />

          <div className="mt-4 space-y-3">
            {loading
              ? Array.from({ length: 2 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-28 animate-pulse rounded-2xl bg-muted"
                  />
                ))
              : SESSIONS.map((session) => {
                  const count = students?.bySession?.find(
                    (item) => item.name === session.name,
                  )?.count
                  const sessionClasses = classes.filter(
                    (klass) => klass.sessionName === session.name,
                  )
                  const sessionEnrolled = sessionClasses.reduce(
                    (total, klass) =>
                      total + enrolledFor(klass.name, session.name),
                    0,
                  )
                  return (
                    <div
                      key={session.id}
                      className={`rounded-2xl border border-border bg-background p-4 ring-4 ${session.ring}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold">
                            {session.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {session.medium} · {session.period}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-heading text-2xl font-extrabold">
                            {count ?? "—"}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            students
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {sessionClasses.map((klass) => (
                          <div
                            key={klass.id}
                            className="rounded-lg border border-border bg-card px-2 py-1.5 text-center"
                          >
                            <p className="text-[11px] text-muted-foreground">
                              {klass.name}
                            </p>
                            <p className="text-sm font-bold">
                              {enrolledFor(klass.name, session.name)}
                            </p>
                          </div>
                        ))}
                      </div>
                      <p className="mt-2 text-right text-[11px] text-muted-foreground">
                        {sessionEnrolled} enrolled across{" "}
                        {sessionClasses.length} classes
                      </p>
                    </div>
                  )
                })}
          </div>
        </section>
      </div>

      {/* -------------------- per-class enrollment table -------------------- */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <SectionHead
          icon={School}
          title="Class-by-class enrollment"
          note="Every class with its class teacher, seat usage and status — the register the office works from."
        />

        <div className="mt-4 overflow-hidden rounded-xl border border-border">
          <Table className="min-w-[720px]">
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead>Session</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Class teacher</TableHead>
                <TableHead className="text-right">Enrolled</TableHead>
                <TableHead className="text-right">Capacity</TableHead>
                <TableHead className="w-44">Seat usage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((__, col) => (
                      <TableCell key={col}>
                        <div className="h-4 w-full max-w-24 animate-pulse rounded bg-muted" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : classes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                    No classes found.
                  </TableCell>
                </TableRow>
              ) : (
                classes.map((klass) => {
                  const enrolled = enrolledFor(klass.name, klass.sessionName)
                  const capacity = klass.capacity || 30
                  const full = enrolled >= capacity
                  return (
                    <TableRow key={klass.id}>
                      <TableCell className="text-sm text-muted-foreground">
                        {klass.sessionName || "—"}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {klass.name}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {klass.classTeacherName || (
                          <span className="text-amber-600 dark:text-amber-400">
                            Unassigned
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-heading font-extrabold">
                        {enrolled}
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {capacity}
                      </TableCell>
                      <TableCell>
                        <Bar
                          value={enrolled}
                          limit={capacity}
                          tone={klass.sessionName === "Afternoon Session" ? "violet" : "primary"}
                        />
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          {full
                            ? "Full"
                            : `${capacity - enrolled} seats free`}
                          {!klass.isActive && " · paused"}
                        </p>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>
            Figures update automatically — the admin office maintains every
            record.
          </span>
          <DbHint />
        </div>
      </section>

      {!loading && !error && (
        <p className="text-center text-xs text-muted-foreground">
          Prepared for {user?.name || "the Principal"} · BAFWWA GEN DHAKA
        </p>
      )}
    </div>
  )
}
