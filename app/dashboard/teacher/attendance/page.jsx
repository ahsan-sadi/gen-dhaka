"use client"

import { useEffect, useMemo, useState } from "react"
import { CalendarCheck, CheckCheck, Loader2, Save } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import PageHeader from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { StatusBadge } from "@/components/shared/role-badge"
import { Skeleton } from "@/components/ui/skeleton"
import { BackendAlert, DbHint } from "@/components/dashboard/status"
import { useTeacherScope } from "@/hooks/use-teacher-scope"
import { useApi } from "@/hooks/use-api"
import { useRequireAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"
import {
  ATTENDANCE_LABELS,
  ATTENDANCE_STATUSES,
} from "@/lib/constants"

const todayISO = () => new Date().toISOString().slice(0, 10)

const STATUS_BUTTON = {
  present:
    "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300",
  absent:
    "border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300",
  late: "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300",
  leave:
    "border-sky-300 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300",
}

const STATUS_MUTED = "border-border bg-background text-muted-foreground hover:bg-muted"

export default function TeacherAttendancePage() {
  const { user } = useRequireAuth(["teacher"])
  const scope = useTeacherScope(user)
  const classes = scope.classes

  const [classId, setClassId] = useState("")
  const [date, setDate] = useState(todayISO)
  const [records, setRecords] = useState({})
  const [saving, setSaving] = useState(false)

  // Default to the first assigned class once the scope loads.
  useEffect(() => {
    if (!classId && classes.length) setClassId(String(classes[0].id))
  }, [classes, classId])

  const klass = classes.find((k) => String(k.id) === classId) || null

  // Roster for the selected class, roll-number order.
  const roster = useMemo(
    () =>
      scope.students
        .filter((student) => String(student.classId) === String(classId))
        .sort(
          (a, b) => (Number(a.rollNo) || 0) - (Number(b.rollNo) || 0),
        ),
    [scope.students, classId],
  )

  // The saved register for this class + date (if the day was marked).
  const dayPath =
    classId && date ? `/api/attendance?classId=${classId}&date=${date}` : ""
  const dayQuery = useApi(dayPath)
  const savedDay = dayQuery.data?.items?.[0] || null

  // Seed the toggles: saved statuses when re-opening a marked day,
  // everyone "present" for a fresh day.
  useEffect(() => {
    if (!classId) {
      setRecords({})
      return
    }
    const mine = scope.students.filter(
      (student) => String(student.classId) === String(classId),
    )
    const existing = dayQuery.data?.items?.[0]
    const map = {}
    for (const student of mine) {
      const found = (existing?.records || []).find(
        (record) => record.studentId === String(student.id ?? student._id),
      )
      map[String(student.id ?? student._id)] = found?.status || "present"
    }
    setRecords(map)
  }, [classId, date, scope.students, dayQuery.data])

  const counts = useMemo(() => {
    const tally = { present: 0, absent: 0, late: 0, leave: 0 }
    for (const status of Object.values(records)) {
      if (tally[status] !== undefined) tally[status] += 1
    }
    return tally
  }, [records])

  const setStatus = (studentId, status) =>
    setRecords((prev) => ({ ...prev, [studentId]: status }))

  const markAllPresent = () =>
    setRecords((prev) => {
      const next = { ...prev }
      for (const student of roster) {
        next[String(student.id ?? student._id)] = "present"
      }
      return next
    })

  const handleSave = async (event) => {
    event.preventDefault()
    if (!classId || !roster.length) return
    setSaving(true)
    try {
      await api.post("/api/attendance", {
        classId,
        date,
        records: Object.entries(records).map(([studentId, status]) => ({
          studentId,
          status,
        })),
      })
      toast.success(
        `Attendance saved — ${klass?.name || "class"} · ${date}`,
      )
      dayQuery.refetch()
    } catch (error) {
      toast.error(error.message || "Could not save attendance")
    } finally {
      setSaving(false)
    }
  }

  /* ------------------------------ states ------------------------------ */
  if (scope.loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Teacher Portal"
          title="Attendance"
          description="Mark daily attendance for your assigned classes — present, absent, late or leave."
        />
        <div className="h-12 w-full max-w-md animate-pulse rounded-xl bg-muted" />
        <div className="h-96 animate-pulse rounded-2xl border border-border bg-card" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Teacher Portal"
        title="Attendance"
        description="Mark daily attendance for your assigned classes — present, absent, late or leave. Re-opening a marked day lets you correct it."
      />

      <BackendAlert error={scope.error || dayQuery.error} />

      {classes.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="You are not a class teacher yet"
          description="The admin office assigns class teachers from Sessions & Classes. Once you own a class, its register appears here."
          actionLabel="Back to overview"
          actionHref="/dashboard/teacher"
        />
      ) : (
        <form onSubmit={handleSave} className="space-y-5">
          {/* ---------------------- class + date picker -------------------- */}
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Class
              </p>
              <div className="flex flex-wrap gap-1.5">
                {classes.map((k) => {
                  const id = String(k.id)
                  const active = id === classId
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setClassId(id)}
                      className={cn(
                        "rounded-lg border px-3 py-1.5 text-sm font-semibold transition-colors",
                        active
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      {k.name}
                      <span className="ml-1.5 text-[11px] font-normal opacity-70">
                        {k.sessionName?.split(" ")[0]}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="attendance-date"
                className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground"
              >
                Date
              </label>
              <Input
                id="attendance-date"
                type="date"
                value={date}
                max={todayISO()}
                onChange={(event) => setDate(event.target.value)}
                className="w-44"
              />
            </div>

            <div className="ml-auto flex items-center gap-3">
              {savedDay && (
                <span className="text-right text-xs text-muted-foreground">
                  <StatusBadge status="active" label="Marked" />{" "}
                  {savedDay.markedByName && `by ${savedDay.markedByName}`}
                </span>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={markAllPresent}
                disabled={!roster.length}
              >
                <CheckCheck className="size-4" /> All present
              </Button>
              <Button
                type="submit"
                disabled={saving || !roster.length || dayQuery.loading}
              >
                {saving ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                Save register
              </Button>
            </div>
          </div>

          {/* --------------------------- tally bar -------------------------- */}
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-sm">
            <span className="font-semibold">
              {roster.length} {roster.length === 1 ? "student" : "students"}
            </span>
            <span className="text-muted-foreground">·</span>
            {ATTENDANCE_STATUSES.map((status) => (
              <span key={status} className="flex items-center gap-1.5">
                <StatusBadge status={status} label={ATTENDANCE_LABELS[status]} />
                <strong className="font-heading text-sm">
                  {counts[status]}
                </strong>
              </span>
            ))}
            <span className="ml-auto text-xs text-muted-foreground">
              {dayQuery.loading
                ? "Loading register…"
                : savedDay
                  ? "Changes update the existing entry"
                  : "Not marked yet — defaults to present"}
            </span>
          </div>

          {/* ---------------------------- roster ---------------------------- */}
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="overflow-x-auto">
              <Table className="min-w-[720px]">
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="w-16">Roll</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead className="text-right">
                      Mark for {date}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dayQuery.loading && !Object.keys(records).length ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Skeleton className="h-4 w-8" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-48" />
                        </TableCell>
                        <TableCell className="text-right">
                          <Skeleton className="ml-auto h-8 w-56 rounded-lg" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : roster.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="py-12 text-center text-sm text-muted-foreground">
                        No students enrolled in this class yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    roster.map((student) => {
                      const id = String(student.id ?? student._id)
                      const status = records[id] || "present"
                      return (
                        <TableRow key={id}>
                          <TableCell>
                            <span className="font-mono text-xs font-medium text-muted-foreground">
                              {student.rollNo ?? "—"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm font-semibold">
                              {student.name}
                            </p>
                            <p className="font-mono text-[11px] text-muted-foreground">
                              {student.studentId}
                            </p>
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-1.5">
                              {ATTENDANCE_STATUSES.map((option) => (
                                <button
                                  key={option}
                                  type="button"
                                  onClick={() => setStatus(id, option)}
                                  aria-pressed={status === option}
                                  className={cn(
                                    "rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors",
                                    status === option
                                      ? STATUS_BUTTON[option]
                                      : STATUS_MUTED,
                                  )}
                                >
                                  {ATTENDANCE_LABELS[option]}
                                </button>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="flex justify-end">
            <DbHint />
          </div>
        </form>
      )}
    </div>
  )
}
