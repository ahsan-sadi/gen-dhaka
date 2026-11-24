"use client"

import Link from "next/link"
import {
  BarChart3,
  CalendarRange,
  GraduationCap,
  MessageSquare,
  School,
  ShieldCheck,
  Users,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import PageHeader from "@/components/shared/page-header"
import StatCard from "@/components/shared/stat-card"
import { StatsGridSkeleton } from "@/components/shared/skeletons"
import { BackendAlert, DbHint } from "@/components/dashboard/status"
import { useApi } from "@/hooks/use-api"
import { useRequireAuth } from "@/lib/auth-context"
import {
  ROLE_LABELS,
  SESSIONS,
  STAFF_HEADCOUNT,
  STAFF_ROLES,
} from "@/lib/constants"

export default function PrincipalOverviewPage() {
  const { user } = useRequireAuth(["principal"])
  const { data, error, loading } = useApi("/api/stats/overview")

  const staff = data?.staff
  const students = data?.students
  const totalStaff =
    staff?.total ??
    STAFF_ROLES.reduce((sum, role) => sum + STAFF_HEADCOUNT[role], 0)

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Office of the Principal"
        title={`Welcome, ${user?.name || "Principal"}`}
        description="A whole-school view of BAFWWA GEN DHAKA — people, sessions, classes and enrollment, all maintained by the administration."
        actions={
          <>
            <Button render={<Link href="/dashboard/principal/reports" />}>
              <BarChart3 className="size-4" /> School Reports
            </Button>
            <Button
              variant="outline"
              render={<Link href="/dashboard/principal/notices" />}
            >
              <MessageSquare className="size-4" /> Notices
            </Button>
          </>
        }
      />

      <BackendAlert error={error} />

      {loading ? (
        <StatsGridSkeleton count={4} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Students"
            value={students?.total ?? "—"}
            sublabel="Across both sessions"
            icon={GraduationCap}
            tone="emerald"
          />
          <StatCard
            label="Total Staff"
            value={totalStaff}
            sublabel="1 Principal · 8 Admin · 65 Teachers · 50 Support"
            icon={Users}
            tone="primary"
          />
          <StatCard
            label="Sessions Running"
            value={SESSIONS.length}
            sublabel="Morning & Afternoon"
            icon={CalendarRange}
            tone="violet"
          />
          <StatCard
            label="Classes"
            value={SESSIONS.reduce((total, s) => total + s.classes.length, 0)}
            sublabel="Play Group → KG"
            icon={School}
            tone="sky"
          />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* --------------------------- staff composition ------------------------- */}
        <section className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-primary" />
            <h2 className="font-heading text-lg font-extrabold tracking-tight">
              Staff composition
            </h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Head-counts are fixed by the school structure and enforced in the
            admin dashboard.
          </p>

          <ul className="mt-4 space-y-3">
            {STAFF_ROLES.map((role) => {
              const value = staff?.[role] ?? STAFF_HEADCOUNT[role]
              const quota = STAFF_HEADCOUNT[role]
              const pct = Math.min(100, Math.round((value / quota) * 100))
              return (
                <li key={role}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{ROLE_LABELS[role]}</span>
                    <span className="text-muted-foreground">
                      {value} / {quota}
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              )
            })}
          </ul>

          <div className="mt-4">
            <DbHint />
          </div>
        </section>

        {/* --------------------------- enrollment ------------------------------- */}
        <section className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2">
            <GraduationCap className="size-4 text-primary" />
            <h2 className="font-heading text-lg font-extrabold tracking-tight">
              Enrollment by session
            </h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Live student counts per session and per class.
          </p>

          <div className="mt-4 space-y-3">
            {SESSIONS.map((session) => {
              const count = students?.bySession?.find(
                (item) => item.name === session.name
              )?.count
              return (
                <div
                  key={session.id}
                  className={`rounded-2xl border border-border bg-background p-4 ring-4 ${session.ring}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">{session.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {session.medium} · {session.period}
                      </p>
                    </div>
                    <p className="font-heading text-2xl font-extrabold">
                      {loading ? "…" : count ?? "—"}
                    </p>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {session.classes.map((name) => {
                      const classCount = students?.byClass?.find(
                        (item) => item.className === name
                      )?.count
                      return (
                        <div
                          key={name}
                          className="rounded-lg border border-border bg-card px-2 py-1.5 text-center"
                        >
                          <p className="text-[11px] text-muted-foreground">
                            {name}
                          </p>
                          <p className="text-sm font-bold">
                            {loading ? "…" : classCount ?? "—"}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}
