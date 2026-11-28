"use client"

import { CalendarCheck, Percent } from "lucide-react"

import PageHeader from "@/components/shared/page-header"
import StatCard from "@/components/shared/stat-card"
import { StatsGridSkeleton } from "@/components/shared/skeletons"
import { EmptyState } from "@/components/shared/empty-state"
import { StatusBadge } from "@/components/shared/role-badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { BackendAlert, DbHint, LoadingRow } from "@/components/dashboard/status"
import { useApi } from "@/hooks/use-api"
import { useRequireAuth } from "@/lib/auth-context"
import { ATTENDANCE_LABELS } from "@/lib/constants"

export default function StudentAttendancePage() {
  useRequireAuth(["student"])

  const query = useApi("/api/attendance/me")

  const items = query.data?.items || []
  const summary = query.data?.summary || {
    present: 0,
    absent: 0,
    late: 0,
    leave: 0,
    total: 0,
  }

  // Late counts as attended (present with a penalty).
  const attended = summary.present + summary.late
  const rate = summary.total
    ? Math.round((attended / summary.total) * 100)
    : null

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Student Portal"
        title="My Attendance"
        description="Your day-by-day attendance history — marked by your class teacher each school day."
      />

      <BackendAlert error={query.error} />

      {query.loading && !query.data ? (
        <StatsGridSkeleton count={4} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Days marked"
            value={summary.total}
            sublabel="Attendance records"
            icon={CalendarCheck}
            tone="primary"
          />
          <StatCard
            label="Present"
            value={summary.present}
            sublabel={`${summary.late} late arrival${summary.late === 1 ? "" : "s"}`}
            icon={CalendarCheck}
            tone="emerald"
          />
          <StatCard
            label="Absent"
            value={summary.absent}
            sublabel={`${summary.leave} on leave`}
            icon={CalendarCheck}
            tone="rose"
          />
          <StatCard
            label="Attendance rate"
            value={rate === null ? "—" : `${rate}%`}
            sublabel="Present + late / marked"
            icon={Percent}
            tone={rate !== null && rate >= 90 ? "emerald" : "amber"}
          />
        </div>
      )}

      {/* ------------------------------ history ---------------------------- */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-heading text-lg font-extrabold tracking-tight">
            Day-by-day record
          </h2>
          {query.loading && query.data && <LoadingRow label="Refreshing…" />}
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Marked by</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {query.loading && !query.data ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="h-4 w-28 animate-pulse rounded bg-muted" />
                    </TableCell>
                    <TableCell>
                      <div className="h-5 w-20 animate-pulse rounded-full bg-muted" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                    </TableCell>
                  </TableRow>
                ))
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="py-12">
                    <EmptyState
                      icon={CalendarCheck}
                      title="No attendance recorded yet"
                      description="Your attendance record will appear here as soon as your class teacher begins marking the register."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                items.map((row) => (
                  <TableRow key={row.date}>
                    <TableCell className="font-medium">{row.date}</TableCell>
                    <TableCell>
                      <StatusBadge
                        status={row.status}
                        label={ATTENDANCE_LABELS[row.status] || row.status}
                      />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {row.markedByName || "Class teacher"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 flex justify-end">
          <DbHint />
        </div>
      </section>
    </div>
  )
}
