"use client"

import { useEffect, useState } from "react"
import {
  BookOpen,
  CalendarCheck,
  Search,
  SearchX,
  UserPlus,
  Users,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import PageHeader from "@/components/shared/page-header"
import { BackendAlert, DbHint, LoadingRow } from "@/components/dashboard/status"
import StudentFormDialog from "@/components/dashboard/students/student-form"
import StudentsTable, {
  StudentsTableError,
} from "@/components/dashboard/students/students-table"
import { useApi } from "@/hooks/use-api"
import { useRequireAuth } from "@/lib/auth-context"
import { cn, docId, toList } from "@/lib/utils"

const STATUS_FILTERS = [
  { id: "all", label: "Everyone" },
  { id: "active", label: "Active only" },
  { id: "inactive", label: "Inactive only" },
]

const PAGE_SIZE = 10

export default function AdminStudentsPage() {
  const { user } = useRequireAuth(["admin"])

  /* ----------------------------- filters ----------------------------- */
  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sessionFilter, setSessionFilter] = useState("all")
  const [classFilter, setClassFilter] = useState("all")
  const [page, setPage] = useState(1)

  /* ------------------------------ form ------------------------------- */
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  // Debounce typing so the API isn't hit on every keystroke.
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim())
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  /* ------------------------- reference data -------------------------- */
  const sessionsQuery = useApi("/api/sessions")
  const classesQuery = useApi("/api/classes")
  const statsQuery = useApi("/api/stats/overview")

  const sessions = toList(sessionsQuery.data, "sessions")
  const allClasses = toList(classesQuery.data, "classes")
  const classes =
    sessionFilter === "all"
      ? allClasses
      : allClasses.filter((klass) => klass.sessionId === sessionFilter)

  /* ----------------------------- the list ---------------------------- */
  const params = new URLSearchParams()
  if (statusFilter !== "all") params.set("status", statusFilter)
  if (sessionFilter !== "all") params.set("sessionId", sessionFilter)
  if (classFilter !== "all") params.set("classId", classFilter)
  if (debouncedQuery) params.set("q", debouncedQuery)
  params.set("page", String(page))
  params.set("limit", String(PAGE_SIZE))

  const listQuery = useApi(`/api/students?${params.toString()}`)

  const rows = listQuery.data?.items || []
  const total = listQuery.data?.total ?? 0
  const pages = listQuery.data?.pages ?? 1

  const students = statsQuery.data?.students
  const studentStats = {
    total: students?.total,
    active: students?.active,
    inactive:
      students && students.total !== undefined
        ? students.total - students.active
        : undefined,
    classes: students?.byClass?.length,
    bySession: students?.bySession || [],
  }

  const stats = studentStats

  const refresh = () => {
    listQuery.refetch()
    statsQuery.refetch()
  }

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (student) => {
    setEditing(student)
    setFormOpen(true)
  }

  const changeStatus = (value) => {
    setStatusFilter(value)
    setPage(1)
  }

  const changeSession = (value) => {
    setSessionFilter(value)
    setClassFilter("all")
    setPage(1)
  }

  const changeClass = (value) => {
    setClassFilter(value)
    setPage(1)
  }

  const error = listQuery.error || statsQuery.error
  const loading = listQuery.loading

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Control Center"
        title="Student Management"
        description="Admissions for both sessions — enroll a student into a class, manage roll numbers, transfer classes and control portal access. New students log in with password 123456."
        actions={
          <Button onClick={openCreate}>
            <UserPlus className="size-4" /> Enroll student
          </Button>
        }
      />

      <BackendAlert error={error} />

      {/* --------------------------- summary ----------------------------- */}
      {statsQuery.loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              <div className="mt-3 h-8 w-16 animate-pulse rounded bg-muted" />
              <div className="mt-4 h-1.5 w-full animate-pulse rounded-full bg-muted" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="card-hover rounded-2xl border border-border bg-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total enrolled
                </p>
                <p className="mt-1 font-heading text-3xl font-extrabold tracking-tight">
                  {stats.total ?? "—"}
                </p>
              </div>
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Users className="size-4.5" />
              </span>
            </div>
          </div>

          <div className="card-hover rounded-2xl border border-border bg-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Active
                </p>
                <p className="mt-1 font-heading text-3xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400">
                  {stats.active ?? "—"}
                </p>
              </div>
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CalendarCheck className="size-4.5" />
              </span>
            </div>
          </div>

          <div className="card-hover rounded-2xl border border-border bg-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Inactive
                </p>
                <p className="mt-1 font-heading text-3xl font-extrabold tracking-tight text-amber-600 dark:text-amber-400">
                  {stats.inactive ?? "—"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Portal login blocked
                </p>
              </div>
            </div>
          </div>

          <div className="card-hover rounded-2xl border border-border bg-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Classes with students
                </p>
                <p className="mt-1 font-heading text-3xl font-extrabold tracking-tight">
                  {stats.classes ?? "—"}
                </p>
              </div>
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
                <BookOpen className="size-4.5" />
              </span>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- per-session breakdown ---------------------- */}
      {!statsQuery.loading && stats.bySession.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl border border-border bg-card px-5 py-3.5 text-sm">
          {stats.bySession.map((entry) => (
            <span key={entry.name} className="flex items-center gap-2">
              <Users className="size-4 text-primary" />
              <strong className="font-heading font-extrabold">
                {entry.count}
              </strong>
              <span className="text-muted-foreground">{entry.name}</span>
            </span>
          ))}
          <span className="ml-auto text-xs text-muted-foreground">
            Morning = English Medium · Afternoon = English Version
          </span>
        </div>
      )}

      {/* --------------------------- filter bar --------------------------- */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div
          className="flex flex-wrap gap-2"
          role="tablist"
          aria-label="Filter by status"
        >
          {STATUS_FILTERS.map((option) => {
            const active = statusFilter === option.id
            return (
              <button
                key={option.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => changeStatus(option.id)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "border-border bg-card text-muted-foreground hover:text-foreground",
                )}
              >
                {option.label}
              </button>
            )
          })}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-64">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name, ID or guardian…"
              className="pr-9 pl-9"
              aria-label="Search students"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground"
              >
                <SearchX className="size-4" />
              </button>
            )}
          </div>

          <NativeSelect
            value={sessionFilter}
            onChange={(event) => changeSession(event.target.value)}
            aria-label="Filter by session"
            className="w-full sm:w-44"
          >
            <NativeSelectOption value="all">All sessions</NativeSelectOption>
            {sessions.map((session) => (
              <NativeSelectOption key={session.id} value={session.id}>
                {session.name}
              </NativeSelectOption>
            ))}
          </NativeSelect>

          <NativeSelect
            value={classFilter}
            onChange={(event) => changeClass(event.target.value)}
            aria-label="Filter by class"
            className="w-full sm:w-40"
            disabled={sessionFilter === "all"}
          >
            <NativeSelectOption value="all">
              {sessionFilter === "all" ? "Pick a session first" : "All classes"}
            </NativeSelectOption>
            {classes.map((klass) => (
              <NativeSelectOption key={klass.id} value={klass.id}>
                {klass.name}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
      </div>

      {/* ----------------------------- table ------------------------------ */}
      {error && !rows.length ? (
        <StudentsTableError error={error} onRetry={refresh} />
      ) : (
        <>
          <StudentsTable
            rows={rows}
            loading={loading}
            currentUserId={docId(user)}
            onEdit={openEdit}
            onChanged={refresh}
          />

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
            <div className="min-h-5 text-xs text-muted-foreground">
              {loading ? (
                <LoadingRow label="Loading students…" />
              ) : (
                <p>
                  Showing{" "}
                  <strong className="text-foreground">
                    {rows.length ? (page - 1) * PAGE_SIZE + 1 : 0}–
                    {(page - 1) * PAGE_SIZE + rows.length}
                  </strong>{" "}
                  of <strong className="text-foreground">{total}</strong>{" "}
                  students
                </p>
              )}
            </div>

            {pages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      aria-disabled={page <= 1}
                      className={cn(
                        page <= 1 && "pointer-events-none opacity-40",
                      )}
                    />
                  </PaginationItem>

                  {Array.from({ length: pages }).map((_, index) => {
                    const pageNumber = index + 1
                    // Keep the control small: first, last and a window around
                    // the current page.
                    const visible =
                      pages <= 7 ||
                      pageNumber === 1 ||
                      pageNumber === pages ||
                      Math.abs(pageNumber - page) <= 1
                    if (!visible) {
                      return pageNumber === 2 || pageNumber === pages - 1 ? (
                        <PaginationItem key={pageNumber}>
                          <span className="px-1.5 text-muted-foreground">
                            …
                          </span>
                        </PaginationItem>
                      ) : null
                    }
                    return (
                      <PaginationItem key={pageNumber}>
                        <PaginationLink
                          isActive={pageNumber === page}
                          onClick={() => setPage(pageNumber)}
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  })}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setPage((p) => Math.min(pages, p + 1))}
                      aria-disabled={page >= pages}
                      className={cn(
                        page >= pages && "pointer-events-none opacity-40",
                      )}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </>
      )}

      <DbHint />

      {/* --------------------------- form dialog -------------------------- */}
      <StudentFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        student={editing}
        onSaved={refresh}
      />
    </div>
  )
}
