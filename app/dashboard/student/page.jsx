"use client"

import Link from "next/link"
import {
  ClipboardCheck,
  GraduationCap,
  IdCard,
  MessageSquare,
  Users,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import PageHeader from "@/components/shared/page-header"
import StatCard from "@/components/shared/stat-card"
import { StatsGridSkeleton } from "@/components/shared/skeletons"
import { BackendAlert, DbHint, LoadingRow } from "@/components/dashboard/status"
import { useApi } from "@/hooks/use-api"
import { useRequireAuth } from "@/lib/auth-context"
import { SESSIONS } from "@/lib/constants"

export default function StudentOverviewPage() {
  const { user } = useRequireAuth(["student"])

  const meQuery = useApi("/api/students/me")
  const statsQuery = useApi("/api/stats/overview")

  const loading = meQuery.loading || statsQuery.loading
  const error = meQuery.error || statsQuery.error
  const me = meQuery.data || user
  const totals = statsQuery.data?.students

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Student Portal"
        title={`Hello, ${user?.name?.split(" ")[0] || "Student"}`}
        description="Your enrollment at a glance — class, session, roll number and school notices. Your record is maintained by the school administration."
        actions={
          <>
            <Button render={<Link href="/dashboard/student/attendance" />}>
              <ClipboardCheck className="size-4" /> My Attendance
            </Button>
            <Button
              variant="outline"
              render={<Link href="/dashboard/student/notices" />}
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
            label="My Class"
            value={me?.className || "—"}
            sublabel={me?.sessionName || "Not enrolled yet"}
            icon={GraduationCap}
            tone="primary"
          />
          <StatCard
            label="Roll Number"
            value={me?.rollNo ?? "—"}
            sublabel={`ID ${me?.studentId || "—"}`}
            icon={IdCard}
            tone="violet"
          />
          <StatCard
            label="Classmates"
            value={
              totals?.byClass?.find((c) => c.className === me?.className)
                ?.count ?? "—"
            }
            sublabel="Students in my class"
            icon={Users}
            tone="emerald"
          />
          <StatCard
            label="School Sessions"
            value={SESSIONS.length}
            sublabel={SESSIONS.map((s) => s.name).join(" · ")}
            icon={MessageSquare}
            tone="amber"
          />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* --------------------------- my record ---------------------------- */}
        <section className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2">
            <IdCard className="size-4 text-primary" />
            <h2 className="font-heading text-lg font-extrabold tracking-tight">
              My school record
            </h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            As held by the admin office — ask the school office for any
            correction.
          </p>

          {loading ? (
            <div className="mt-4">
              <LoadingRow label="Loading your record…" />
            </div>
          ) : (
            <dl className="mt-4 space-y-2.5 text-sm">
              {[
                ["Full name", me?.name],
                ["Student ID", me?.studentId],
                ["Class", me?.className],
                ["Session", me?.sessionName],
                ["Roll no", me?.rollNo],
                ["Date of birth", me?.dateOfBirth],
                ["Guardian", me?.guardianName],
                ["Guardian phone", me?.guardianPhone],
                ["Status", me?.status],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-3.5 py-2.5"
                >
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="text-right font-medium capitalize">
                    {value ?? "—"}
                  </dd>
                </div>
              ))}
            </dl>
          )}
          {!loading && <div className="mt-4"><DbHint /></div>}
        </section>

        {/* ------------------------- sessions at a glance -------------------- */}
        <section className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2">
            <GraduationCap className="size-4 text-primary" />
            <h2 className="font-heading text-lg font-extrabold tracking-tight">
              My session &amp; classmates
            </h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Both academic sessions of BAFWWA GEN DHAKA.
          </p>

          <div className="mt-4 space-y-3">
            {SESSIONS.map((session) => {
              const mine = session.name === me?.sessionName
              const count = totals?.bySession?.find(
                (item) => item.name === session.name
              )?.count
              return (
                <div
                  key={session.id}
                  className={`rounded-2xl border border-border bg-background p-4 ring-4 ${mine ? session.ring : "ring-transparent opacity-70"}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">
                        {session.name}
                        {mine && (
                          <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                            Mine
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {session.medium} · {session.period}
                      </p>
                    </div>
                    <p className="font-heading text-xl font-extrabold">
                      {loading ? "…" : count ?? "—"}
                    </p>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {session.classes.map((name) => (
                      <span
                        key={name}
                        className={`rounded-lg border px-2.5 py-1 text-xs font-medium ${
                          mine && name === me?.className
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-card"
                        }`}
                      >
                        {name}
                      </span>
                    ))}
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
