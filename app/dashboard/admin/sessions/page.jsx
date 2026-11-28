"use client"

import { useState } from "react"
import {
  BookOpen,
  CalendarRange,
  GraduationCap,
  Layers,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  Power,
  Trash2,
  UserCheck,
  Users,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import PageHeader from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/role-badge"
import { BackendAlert, DbHint } from "@/components/dashboard/status"
import ClassFormDialog from "@/components/dashboard/sessions/class-form"
import SessionFormDialog, {
  SessionActiveSwitch,
} from "@/components/dashboard/sessions/session-form"
import { useApi } from "@/hooks/use-api"
import { useRequireAuth } from "@/lib/auth-context"
import { SESSIONS } from "@/lib/constants"
import { api } from "@/lib/api"
import { cn, docId, toList } from "@/lib/utils"

/* Visual identity per session, kept in step with the landing page. */
const ACCENTS = {
  "Morning Session": {
    bar: "from-indigo-500 to-violet-500",
    ring: "ring-indigo-500/20",
  },
  "Afternoon Session": {
    bar: "from-fuchsia-500 to-pink-500",
    ring: "ring-fuchsia-500/20",
  },
}

const DEFAULT_ACCENT = { bar: "from-sky-500 to-indigo-500", ring: "ring-sky-500/20" }

function StatPill({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2">
      <Icon className="size-3.5 text-primary" />
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="ml-auto font-heading text-sm font-extrabold">
        {value}
      </span>
    </div>
  )
}

export default function AdminSessionsPage() {
  const { user } = useRequireAuth(["admin"])

  const sessionsQuery = useApi("/api/sessions")
  const classesQuery = useApi("/api/classes")
  const statsQuery = useApi("/api/stats/overview")
  const teachersQuery = useApi("/api/staff?role=teacher&limit=100")

  const sessions = toList(sessionsQuery.data, "sessions")
  const classes = toList(classesQuery.data, "classes")
  const byClass = statsQuery.data?.students?.byClass || []
  const bySession = statsQuery.data?.students?.bySession || []
  const studentsTotal = statsQuery.data?.students?.total

  const [sessionFilter, setSessionFilter] = useState("all")
  const [sessionDialog, setSessionDialog] = useState(null)
  const [classDialog, setClassDialog] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [busy, setBusy] = useState(false)

  const loading = sessionsQuery.loading || classesQuery.loading
  const error =
    sessionsQuery.error || classesQuery.error || statsQuery.error

  const refresh = () => {
    sessionsQuery.refetch()
    classesQuery.refetch()
    statsQuery.refetch()
    teachersQuery.refetch()
  }

  const studentsInClass = (klass) =>
    byClass.find(
      (row) =>
        row.className === klass.name && row.sessionName === klass.sessionName,
    )?.count ?? 0

  const studentsInSession = (name) =>
    bySession.find((row) => row.name === name)?.count ?? 0

  const classesOf = (session) =>
    classes.filter((klass) => klass.sessionId === session.id)

  const visibleClasses =
    sessionFilter === "all"
      ? classes
      : classes.filter((klass) => klass.sessionId === sessionFilter)

  const assignedCount = classes.filter((klass) => klass.classTeacherId).length

  const openCreateClass = () => {
    setClassDialog({
      open: true,
      klass: null,
      defaultSessionId:
        sessionFilter !== "all" ? sessionFilter : (sessions[0]?.id ?? ""),
    })
  }

  const openEditClass = (klass) => {
    setClassDialog({ open: true, klass, defaultSessionId: klass.sessionId })
  }

  const toggleClass = async (klass) => {
    const id = docId(klass)
    const next = klass.isActive === false
    try {
      await api.patch(`/api/classes/${id}`, { isActive: next })
      toast.success(`${klass.name} ${next ? "activated" : "paused"}`)
      refresh()
    } catch (err) {
      toast.error(err.message || "Could not update this class")
    }
  }

  const confirmDelete = async () => {
    const target = pendingDelete
    if (!target) return
    setBusy(true)
    try {
      if (target.type === "session") {
        await api.del(`/api/sessions/${docId(target.doc)}`)
        toast.success(`${target.doc.name} deleted`)
        setSessionDialog(null)
      } else {
        await api.del(`/api/classes/${docId(target.doc)}`)
        toast.success(`${target.doc.name} deleted`)
        setClassDialog(null)
      }
      setPendingDelete(null)
      refresh()
    } catch (err) {
      toast.error(err.message || "Could not delete")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Control Center"
        title={"Sessions & Classes"}
        description="The fixed academic structure of the school — Morning Session (English Medium, July–June) with Play Group, Nursery-I, Nursery-II and KG, and Afternoon Session (English Version, January–December) with Play Group and Nursery."
        actions={
          <Button onClick={openCreateClass}>
            <Plus className="size-4" /> Add class
          </Button>
        }
      />

      <BackendAlert error={error} />

      {/* ---------------------------- summary ---------------------------- */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatPill
          icon={CalendarRange}
          label="Sessions"
          value={loading ? "…" : sessions.length}
        />
        <StatPill
          icon={Layers}
          label="Classes"
          value={loading ? "…" : classes.length}
        />
        <StatPill
          icon={GraduationCap}
          label="Students"
          value={loading ? "…" : studentsTotal ?? "—"}
        />
        <StatPill
          icon={UserCheck}
          label="Class teachers assigned"
          value={loading ? "…" : `${assignedCount}/${classes.length}`}
        />
      </div>

      {/* --------------------------- sessions ---------------------------- */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <Skeleton className="h-5 w-44" />
              <Skeleton className="mt-2 h-4 w-56" />
              <Skeleton className="mt-5 h-14 w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {sessions.map((session) => {
            const accent = ACCENTS[session.name] || DEFAULT_ACCENT
            const sessionClasses = classesOf(session)
            const preset =
              SESSIONS.find((s) => s.name === session.name)?.classes || []

            return (
              <section
                key={session.id || session._id}
                className={cn(
                  "overflow-hidden rounded-2xl border border-border bg-card ring-4",
                  accent.ring,
                )}
              >
                <div className={`h-1.5 w-full bg-gradient-to-r ${accent.bar}`} />

                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-heading text-lg font-extrabold tracking-tight">
                        {session.name}
                      </h2>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {session.medium} · {session.period}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {session.startMonth} → {session.endMonth}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <SessionActiveSwitch
                        session={session}
                        onSaved={refresh}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSessionDialog(session)}
                      >
                        <Pencil className="size-3.5" /> Edit
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-2 sm:grid-cols-3">
                    <StatPill
                      icon={BookOpen}
                      label="Classes"
                      value={sessionClasses.length}
                    />
                    <StatPill
                      icon={Users}
                      label="Students"
                      value={studentsInSession(session.name)}
                    />
                    <StatPill
                      icon={GraduationCap}
                      label="Assigned"
                      value={`${sessionClasses.filter((c) => c.classTeacherId).length}/${sessionClasses.length}`}
                    />
                  </div>

                  <p className="mt-4 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    Classes in this session
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {sessionClasses.length === 0 ? (
                      <span className="text-sm text-muted-foreground">
                        No classes yet — add one to start enrolling students.
                      </span>
                    ) : (
                      sessionClasses.map((klass) => (
                        <button
                          key={klass.id || klass._id}
                          type="button"
                          onClick={() => openEditClass(klass)}
                          className={cn(
                            "rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors",
                            klass.isActive === false
                              ? "border-border bg-muted text-muted-foreground opacity-60"
                              : "border-border bg-background hover:border-primary hover:text-primary",
                          )}
                          title={`${klass.classTeacherName || "No class teacher"} · ${studentsInClass(klass)} students`}
                        >
                          {klass.name}
                          <span className="ml-1.5 text-muted-foreground">
                            {studentsInClass(klass)}
                          </span>
                        </button>
                      ))
                    )}
                    {preset.length > 0 && sessionClasses.length > 0 && (
                      <span className="text-[11px] text-muted-foreground">
                        standard: {preset.join(", ")}
                      </span>
                    )}
                  </div>
                </div>
              </section>
            )
          })}
        </div>
      )}

      {/* ---------------------------- classes ---------------------------- */}
      <section className="rounded-2xl border border-border bg-card">
        <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-heading text-lg font-extrabold tracking-tight">
              Classes
            </h2>
            <p className="text-sm text-muted-foreground">
              Assign class teachers, set capacity and manage enrolment groups.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSessionFilter("all")}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                sessionFilter === "all"
                  ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "border-border bg-background text-muted-foreground hover:text-foreground",
              )}
            >
              All sessions
            </button>
            {sessions.map((session) => (
              <button
                key={session.id}
                type="button"
                onClick={() => setSessionFilter(session.id)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                  sessionFilter === session.id
                    ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "border-border bg-background text-muted-foreground hover:text-foreground",
                )}
              >
                {session.name.replace(" Session", "")}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table className="min-w-[720px]">
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead>Class</TableHead>
                <TableHead>Session</TableHead>
                <TableHead>Class teacher</TableHead>
                <TableHead>Enrolled</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((__, c) => (
                      <TableCell key={c}>
                        <Skeleton
                          className={c === 0 ? "h-4 w-28" : "h-4 max-w-24"}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : visibleClasses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-14 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center gap-2">
                      <Layers className="size-8 text-muted-foreground/60" />
                      <p className="font-heading text-base font-bold">
                        No classes in this view
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Add a class to this session to start enrolling students.
                      </p>
                      <Button size="sm" className="mt-2" onClick={openCreateClass}>
                        <Plus className="size-4" /> Add class
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                visibleClasses.map((klass) => {
                  const id = docId(klass)
                  const enrolled = studentsInClass(klass)
                  const full = enrolled >= (klass.capacity || 30)

                  return (
                    <TableRow key={id}>
                      <TableCell>
                        <p className="text-sm font-semibold">{klass.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {klass.medium || ""}
                        </p>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {klass.sessionName}
                        </span>
                      </TableCell>
                      <TableCell>
                        {klass.classTeacherName ? (
                          <div className="flex items-center gap-2">
                            <UserCheck className="size-3.5 text-emerald-500" />
                            <span className="text-sm">
                              {klass.classTeacherName}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-amber-600 dark:text-amber-400">
                            Unassigned
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "text-sm font-medium",
                            full ? "text-amber-600 dark:text-amber-400" : "",
                          )}
                        >
                          {enrolled}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {klass.capacity ?? 30}
                        </span>
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          status={klass.isActive === false ? "inactive" : "active"}
                          label={
                            klass.isActive === false ? "Paused" : "Running"
                          }
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            aria-label={`Actions for ${klass.name}`}
                            className="inline-flex size-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
                          >
                            <MoreHorizontal className="size-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuGroup>
                              <DropdownMenuLabel>Manage</DropdownMenuLabel>
                            </DropdownMenuGroup>
                            <DropdownMenuItem
                              onClick={() => openEditClass(klass)}
                            >
                              <Pencil /> Edit class
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => toggleClass(klass)}
                            >
                              <Power />
                              {klass.isActive === false ? "Activate" : "Pause"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() =>
                                setPendingDelete({ type: "class", doc: klass })
                              }
                            >
                              <Trash2 /> Delete class
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      <DbHint />

      {/* ----------------------------- dialogs --------------------------- */}
      <SessionFormDialog
        open={Boolean(sessionDialog)}
        onOpenChange={(open) => {
          if (!open) setSessionDialog(null)
        }}
        session={sessionDialog}
        onSaved={refresh}
        onRequestDelete={(doc) =>
          setPendingDelete({ type: "session", doc })
        }
      />

      <ClassFormDialog
        open={Boolean(classDialog?.open)}
        onOpenChange={(open) => {
          if (!open) setClassDialog(null)
        }}
        klass={classDialog?.klass}
        sessions={sessions}
        teachers={teachersQuery.data}
        defaultSessionId={classDialog?.defaultSessionId}
        onSaved={refresh}
        onRequestDelete={(doc) =>
          setPendingDelete({ type: "class", doc })
        }
      />

      <AlertDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading">
              Delete {pendingDelete?.doc?.name}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete?.type === "session"
                ? "A session can only be deleted while it has no classes and no enrolled students. Remove those first."
                : "A class can only be deleted while no students are enrolled in it. Students must be transferred or removed from the Students module first."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={busy}
              onClick={confirmDelete}
            >
              {busy ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
