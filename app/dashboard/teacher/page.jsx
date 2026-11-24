"use client"

import Link from "next/link"
import {
  BookOpen,
  ClipboardCheck,
  GraduationCap,
  MessageSquare,
  Users,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import PageHeader from "@/components/shared/page-header"
import StatCard from "@/components/shared/stat-card"
import { StatsGridSkeleton } from "@/components/shared/skeletons"
import { BackendAlert, DbHint, LoadingRow } from "@/components/dashboard/status"
import { EmptyState } from "@/components/shared/empty-state"
import { useApi } from "@/hooks/use-api"
import { useRequireAuth } from "@/lib/auth-context"
import { SESSIONS } from "@/lib/constants"
import { docId, toList } from "@/lib/utils"

export default function TeacherOverviewPage() {
  const { user } = useRequireAuth(["teacher"])

  const classesQuery = useApi("/api/classes")
  const statsQuery = useApi("/api/stats/overview")

  const loading = classesQuery.loading || statsQuery.loading
  const error = classesQuery.error || statsQuery.error

  const allClasses = toList(classesQuery.data, "classes")
  const myClasses = allClasses.filter(
    (cls) => cls.classTeacherId && docId(cls.classTeacherId) === docId(user)
  )

  const studentsByClass = statsQuery.data?.students?.byClass || []
  const myStudents = myClasses.reduce((total, cls) => {
    const found = studentsByClass.find((item) => item.className === cls.name)
    return total + (found?.count || 0)
  }, 0)

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Teacher Portal"
        title={`Good day, ${user?.name?.split(" ")[0] || "Teacher"}`}
        description="Your assigned classes, student counts and daily routines. Class lists, rosters and schedules are maintained by the admin office."
        actions={
          <>
            <Button render={<Link href="/dashboard/teacher/attendance" />}>
              <ClipboardCheck className="size-4" /> Take Attendance
            </Button>
            <Button
              variant="outline"
              render={<Link href="/dashboard/teacher/my-classes" />}
            >
              <BookOpen className="size-4" /> My Classes
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
            label="My Classes"
            value={myClasses.length}
            sublabel="Where you are class teacher"
            icon={BookOpen}
            tone="primary"
          />
          <StatCard
            label="My Students"
            value={myStudents}
            sublabel="Across your assigned classes"
            icon={Users}
            tone="emerald"
          />
          <StatCard
            label="School Sessions"
            value={SESSIONS.length}
            sublabel={SESSIONS.map((s) => s.name).join(" · ")}
            icon={GraduationCap}
            tone="violet"
          />
          <StatCard
            label="Notices"
            value="—"
            sublabel="Published by the administration"
            icon={MessageSquare}
            tone="amber"
          />
        </div>
      )}

      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-heading text-lg font-extrabold tracking-tight">
              My classes
            </h2>
            <p className="text-sm text-muted-foreground">
              Classes where the admin office has appointed you as class teacher.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            render={<Link href="/dashboard/teacher/my-classes" />}
          >
            View all <BookOpen className="size-4" />
          </Button>
        </div>

        <div className="mt-4">
          {loading ? (
            <LoadingRow label="Loading your classes…" />
          ) : myClasses.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No class assigned yet"
              description="The admin office assigns class teachers under Sessions & Classes. You will see your class, its session and student count here as soon as it is assigned."
              actionLabel="Open my students"
              actionHref="/dashboard/teacher/students"
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {myClasses.map((cls) => {
                const count = studentsByClass.find(
                  (item) => item.className === cls.name
                )?.count
                const session = SESSIONS.find((s) => s.id === cls.sessionId)
                return (
                  <div
                    key={docId(cls)}
                    className={`rounded-2xl border border-border bg-background p-4 ring-4 ${session?.ring || "ring-transparent"}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-heading text-base font-bold tracking-tight">
                          {cls.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {cls.sessionName || session?.name}
                        </p>
                      </div>
                      <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                        {count ?? "—"} students
                      </span>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        render={
                          <Link href="/dashboard/teacher/attendance" />
                        }
                      >
                        <ClipboardCheck className="size-3.5" /> Attendance
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="flex-1"
                        render={<Link href="/dashboard/teacher/students" />}
                      >
                        <Users className="size-3.5" /> Roster
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          {!loading && !error && <div className="mt-4"><DbHint /></div>}
        </div>
      </section>
    </div>
  )
}
