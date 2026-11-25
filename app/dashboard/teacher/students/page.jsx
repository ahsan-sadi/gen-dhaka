"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { BookOpen, Search, SearchX, UsersRound } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import PageHeader from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { BackendAlert, DbHint, LoadingRow } from "@/components/dashboard/status"
import RosterTable, {
  RosterTableError,
} from "@/components/dashboard/teacher/roster-table"
import { useRequireAuth } from "@/lib/auth-context"
import { useTeacherScope } from "@/hooks/use-teacher-scope"
import { cn, docId } from "@/lib/utils"

export default function TeacherStudentsPage() {
  const { user } = useRequireAuth(["teacher"])
  const { classes, students, loading, error, refetch } = useTeacherScope(user)

  const [classFilter, setClassFilter] = useState("all")
  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")

  // Deep link from My Classes: /dashboard/teacher/students?class=<id>
  useEffect(() => {
    const preset = new URLSearchParams(window.location.search).get("class")
    if (preset) setClassFilter(preset)
  }, [])

  // Debounce typing so filtering isn't recomputed on every keystroke.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 300)
    return () => clearTimeout(timer)
  }, [query])

  const visible = useMemo(() => {
    const needle = debouncedQuery.toLowerCase()
    return students
      .filter(
        (student) =>
          classFilter === "all" ||
          String(student.classId) === String(classFilter),
      )
      .filter((student) => {
        if (!needle) return true
        return [student.name, student.studentId, student.guardianName]
          .filter(Boolean)
          .some((field) => String(field).toLowerCase().includes(needle))
      })
      // Roll number first, exactly like a printed register.
      .sort((a, b) => (Number(a.rollNo) || 0) - (Number(b.rollNo) || 0))
  }, [students, classFilter, debouncedQuery])

  const pickClass = (value) => {
    setClassFilter(value)
  }

  if (classes.length === 0 && !loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Teacher Portal"
          title="My Students"
          description="Student lists for the classes you teach."
        />
        <BackendAlert error={error} />
        <EmptyState
          icon={UsersRound}
          title="No class assigned yet"
          description="You will see searchable rosters with guardian contacts here as soon as the admin office appoints you as class teacher."
          actionLabel="Back to overview"
          actionHref="/dashboard/teacher"
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Teacher Portal"
        title="My Students"
        description="Rosters for your classes with roll numbers, guardian contacts and portal status. Records are maintained by the admin office."
        actions={
          <Button
            variant="outline"
            render={<Link href="/dashboard/teacher/my-classes" />}
          >
            <BookOpen className="size-4" /> My classes
          </Button>
        }
      />

      <BackendAlert error={error} />

      {/* --------------------------- filter bar --------------------------- */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div
          className="flex flex-wrap gap-2"
          role="tablist"
          aria-label="Filter by class"
        >
          <button
            key="all"
            type="button"
            role="tab"
            aria-selected={classFilter === "all"}
            onClick={() => pickClass("all")}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
              classFilter === "all"
                ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            All my students
          </button>
          {classes.map((klass) => (
            <button
              key={docId(klass)}
              type="button"
              role="tab"
              aria-selected={String(classFilter) === String(docId(klass))}
              onClick={() => pickClass(docId(klass))}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                String(classFilter) === String(docId(klass))
                  ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "border-border bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              {klass.name}
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-72">
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
      </div>

      {/* ----------------------------- roster ----------------------------- */}
      {error && !students.length ? (
        <RosterTableError error={error} onRetry={refetch} />
      ) : (
        <>
          <RosterTable
            rows={visible}
            loading={loading}
            emptyHint={
              debouncedQuery
                ? `Nothing matches “${debouncedQuery}” — try another name or ID.`
                : "No students are enrolled in this class yet."
            }
          />

          <div className="min-h-5 text-xs text-muted-foreground">
            {loading ? (
              <LoadingRow label="Loading your roster…" />
            ) : (
              <p>
                Showing{" "}
                <strong className="text-foreground">{visible.length}</strong> of{" "}
                <strong className="text-foreground">{students.length}</strong>{" "}
                students in your{" "}
                {classes.length === 1 ? "class" : `${classes.length} classes`}
              </p>
            )}
          </div>
        </>
      )}

      <DbHint />
    </div>
  )
}
