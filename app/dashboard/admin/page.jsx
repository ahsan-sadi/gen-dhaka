"use client"

import Link from "next/link"
import {
  CalendarRange,
  GraduationCap,
  ShieldCheck,
  UserCheck,
  Users,
  UsersRound,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import PageHeader from "@/components/shared/page-header"
import StatCard from "@/components/shared/stat-card"
import { StatsGridSkeleton } from "@/components/shared/skeletons"
import { BackendAlert, DbHint } from "@/components/dashboard/status"
import { useApi } from "@/hooks/use-api"
import { cn } from "@/lib/utils"
import {
  ROLE_LABELS,
  SESSIONS,
  STAFF_HEADCOUNT,
  STAFF_QUOTAS,
} from "@/lib/constants"
import { useRequireAuth } from "@/lib/auth-context"

export default function AdminOverviewPage() {
  const { user } = useRequireAuth(["admin"])
  const { data, error, loading } = useApi("/api/stats/overview")

  const staff = data?.staff
  // Find the principal staff record (there should be exactly one)
  // Fetch principal data separately (stats/overview only returns counts)
  const principalQuery = useApi("/api/staff?role=principal&limit=1");
  const principal = principalQuery.data?.items?.[0] || null;
  const students = data?.students

  // Find the principal staff record (there should be exactly one)

  const stats = [
    {
      label: ROLE_LABELS.principal,
      value: staff?.principal ?? STAFF_HEADCOUNT.principal,
      sublabel: "Head of the school",
      icon: ShieldCheck,
      tone: "violet",
    },
    {
      label: ROLE_LABELS.admin,
      value: staff?.admin ?? STAFF_HEADCOUNT.admin,
      sublabel: `Quota ${STAFF_QUOTAS.admin} · control center`,
      icon: Users,
      tone: "sky",
    },
    {
      label: ROLE_LABELS.teacher,
      value: staff?.teacher ?? STAFF_HEADCOUNT.teacher,
      sublabel: `Quota ${STAFF_QUOTAS.teacher} across both sessions`,
      icon: GraduationCap,
      tone: "primary",
    },
    {
      label: ROLE_LABELS.support,
      value: staff?.support ?? STAFF_HEADCOUNT.support,
      sublabel: `Quota ${STAFF_QUOTAS.support} · admin-managed only`,
      icon: UsersRound,
      tone: "amber",
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Control Center"
        title={`Welcome back, ${user?.name?.split(" ")[0] || "Admin"}`}
        description="Everything the school runs — staff, sessions, classes and admissions — is created and maintained right here. The Principal, Teacher and Student dashboards read only what you set up."
        actions={
          <>
            <Button render={<Link href="/dashboard/admin/staff" />}>
              <Users className="size-4" /> Manage Staff
            </Button>
            <Button
              variant="outline"
              render={<Link href="/dashboard/admin/students" />}
            >
              <GraduationCap className="size-4" /> Admissions
            </Button>
          </>
        }
      />


      {/* -------------------------- principal info ------------------------- */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="font-heading text-lg font-extrabold tracking-tight">Principal Information</h2>
        {loading && <p className="text-sm text-muted-foreground">Loading principal info…</p>}
        {!loading && principal && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-heading text-base">{principal.name}</p>
              <p className="text-sm text-muted-foreground">Employee ID</p>
              <p className="font-mono text-sm">{principal.employeeId || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Role</p>
              <p className="font-medium bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:border-violet-500/30 rounded px-2 py-0.5">Principal</p>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className={principal.status === "active" ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-rose-600 dark:text-rose-400 font-medium"}>{principal.status}</p>
            </div>
          </div>
        )}
        {!loading && principal && (
          <div className="mt-4">
            <Button variant="outline" onClick={() => window.alert("Principal edit coming soon — use Staff Management to update principal details.")}>
              Edit principal information
            </Button>
          </div>
        )}
        {!loading && !principal && (
          <p className="text-sm text-muted-foreground">No principal record found — use <a href="/dashboard/admin/staff">Staff Management</a> to add the principal.</p>
        )}
      </section>

      <BackendAlert error={error} />

      {loading ? (
        <StatsGridSkeleton count={4} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Students Enrolled"
          value={students?.total ?? (loading ? "…" : "—")}
          sublabel="Admissions created by the admin office"
          icon={GraduationCap}
          tone="emerald"
        />
        <StatCard
          label="Sessions"
          value={SESSIONS.length}
          sublabel="Morning & Afternoon"
          icon={CalendarRange}
          tone="primary"
        />
        <StatCard
          label="Classes"
          value={SESSIONS.reduce((total, s) => total + s.classes.length, 0)}
          sublabel="Play Group → KG across both sessions"
          icon={UsersRound}
          tone="violet"
        />
        <StatCard
          label="Active Logins"
          value={staff ? staff.total + (students?.total ?? 0) : "—"}
          sublabel="Staff + student portal accounts"
          icon={UserCheck}
          tone="sky"
        />
      </div>

      {/* --------------------------- sessions summary --------------------------- */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-heading text-lg font-extrabold tracking-tight">
              Sessions &amp; classes
            </h2>
            <p className="text-sm text-muted-foreground">
              The fixed academic structure of {SESSIONS.length === 2 && "both "}
              the school, managed under Sessions &amp; Classes.
            </p>
          </div>
          <Button variant="outline" size="sm" render={<Link href="/dashboard/admin/sessions" />}>
            <CalendarRange className="size-4" /> Manage sessions
          </Button>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {SESSIONS.map((session) => {
            const count = students?.bySession?.find(
              (item) => item.name === session.name
            )?.count
            return (
              <div
                key={session.id}
                className={`rounded-2xl border border-border bg-background p-4 ring-4 ${session.ring}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-heading text-base font-bold">
                      {session.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {session.medium} · {session.period}
                    </p>
                  </div>
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                    {count === undefined ? "—" : count} students
                  </span>
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {session.classes.map((name) => {
                    const classCount = students?.byClass?.find(
                      (item) => item.className === name
                    )?.count
                    return (
                      <div
                        key={name}
                        className="flex items-center justify-between rounded-xl border border-border bg-card px-3 py-2 text-sm"
                      >
                        <span className="font-medium">{name}</span>
                        <span className="text-xs text-muted-foreground">
                          {classCount ?? "—"}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-4">
          <DbHint />
        </div>
      </section>
    </div>
  )
}
