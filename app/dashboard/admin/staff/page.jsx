"use client"

import { useEffect, useState } from "react"
import {
  Activity,
  GraduationCap,
  Search,
  SearchX,
  ShieldCheck,
  UserPlus,
  Users,
  UsersRound,
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
import StaffFormDialog from "@/components/dashboard/staff/staff-form"
import StaffTable, {
  StaffTableError,
} from "@/components/dashboard/staff/staff-table"
import { QuotaBar, QUOTA_TONES } from "@/components/dashboard/staff/quota-bar"
import { useApi } from "@/hooks/use-api"
import { useRequireAuth } from "@/lib/auth-context"
import { STAFF_QUOTAS } from "@/lib/constants"
import { cn, docId } from "@/lib/utils"

const ROLE_FILTERS = [
  { id: "all", label: "Everyone" },
  { id: "principal", label: "Principal" },
  { id: "admin", label: "Admin Staff" },
  { id: "teacher", label: "Teachers" },
  { id: "support", label: "Support Staff" },
]

const QUOTA_CARDS = [
  { role: "principal", label: "Principal", icon: ShieldCheck, tone: "violet" },
  { role: "admin", label: "Admin Staff", icon: Users, tone: "sky" },
  { role: "teacher", label: "Teachers", icon: GraduationCap, tone: "primary" },
  { role: "support", label: "Support Staff", icon: UsersRound, tone: "amber" },
]

export default function AdminStaffPage() {
  const { user } = useRequireAuth(["admin"])

  /* ----------------------------- filters ----------------------------- */
  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
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

  const params = new URLSearchParams()
  if (roleFilter !== "all") params.set("role", roleFilter)
  if (statusFilter !== "all") params.set("status", statusFilter)
  if (debouncedQuery) params.set("q", debouncedQuery)
  params.set("page", String(page))
  params.set("limit", "10")

  const listQuery = useApi(`/api/staff?${params.toString()}`)
  const statsQuery = useApi("/api/staff/stats")

  const rows = listQuery.data?.items || []
  const total = listQuery.data?.total ?? 0
  const pages = listQuery.data?.pages ?? 1
  const stats = statsQuery.data

  const refresh = () => {
    listQuery.refetch()
    statsQuery.refetch()
  }

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (person) => {
    setEditing(person)
    setFormOpen(true)
  }

  const changeRole = (value) => {
    setRoleFilter(value)
    setPage(1)
  }

  const changeStatus = (value) => {
    setStatusFilter(value)
    setPage(1)
  }

  const error = listQuery.error || statsQuery.error
  const loading = listQuery.loading

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Control Center"
        title="Staff Management"
        description="Every staff record of the school is created here — 1 Principal, 8 Admin staff, 65 Teachers and 50 Supporting Staff. Quotas are enforced by the system, and supporting staff never receive a login."
        actions={
          <Button onClick={openCreate}>
            <UserPlus className="size-4" /> Add staff
          </Button>
        }
      />

      <BackendAlert error={error} />

      {/* --------------------------- quota cards --------------------------- */}
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
          {QUOTA_CARDS.map((card) => {
            const Icon = card.icon
            return (
              <div
                key={card.role}
                className="card-hover rounded-2xl border border-border bg-card p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {card.label}
                    </p>
                    <p className="mt-1 font-heading text-3xl font-extrabold tracking-tight">
                      {stats ? stats[card.role] : "—"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Quota {STAFF_QUOTAS[card.role]} fixed
                    </p>
                  </div>
                  <span
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-lg",
                      QUOTA_TONES[card.tone],
                    )}
                  >
                    <Icon className="size-4.5" />
                  </span>
                </div>
                <QuotaBar
                  used={Number(stats?.[card.role] ?? 0)}
                  limit={STAFF_QUOTAS[card.role]}
                />
              </div>
            )
          })}
        </div>
      )}

      {/* ------------------------- totals strip --------------------------- */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl border border-border bg-card px-5 py-3.5 text-sm">
        <span className="flex items-center gap-2">
          <Users className="size-4 text-primary" />
          <strong className="font-heading font-extrabold">
            {stats?.total ?? "—"}
          </strong>
          <span className="text-muted-foreground">total staff</span>
        </span>
        <span className="flex items-center gap-2">
          <Activity className="size-4 text-emerald-500" />
          <strong className="font-heading font-extrabold">
            {stats?.active ?? "—"}
          </strong>
          <span className="text-muted-foreground">active</span>
        </span>
        <span className="text-muted-foreground">
          <strong className="font-heading font-extrabold text-foreground">
            {stats?.inactive ?? "—"}
          </strong>{" "}
          inactive
        </span>
        <span className="ml-auto text-xs text-muted-foreground">
          Supporting staff have no portal login — records only.
        </span>
      </div>

      {/* --------------------------- filter bar --------------------------- */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by role">
          {ROLE_FILTERS.map((option) => {
            const active = roleFilter === option.id
            return (
              <button
                key={option.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => changeRole(option.id)}
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
              placeholder="Search name, email or ID…"
              className="pr-9 pl-9"
              aria-label="Search staff"
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
            value={statusFilter}
            onChange={(event) => changeStatus(event.target.value)}
            aria-label="Filter by status"
            className="w-full sm:w-40"
          >
            <NativeSelectOption value="all">All statuses</NativeSelectOption>
            <NativeSelectOption value="active">Active only</NativeSelectOption>
            <NativeSelectOption value="inactive">Inactive only</NativeSelectOption>
          </NativeSelect>
        </div>
      </div>

      {/* ----------------------------- table ------------------------------ */}
      {error && !rows.length ? (
        <StaffTableError error={error} onRetry={refresh} />
      ) : (
        <>
          <StaffTable
            rows={rows}
            loading={loading}
            currentUserId={docId(user)}
            onEdit={openEdit}
            onChanged={refresh}
          />

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
            <div className="min-h-5 text-xs text-muted-foreground">
              {loading ? (
                <LoadingRow label="Loading staff…" />
              ) : (
                <p>
                  Showing{" "}
                  <strong className="text-foreground">
                    {rows.length ? (page - 1) * 10 + 1 : 0}–
                    {(page - 1) * 10 + rows.length}
                  </strong>{" "}
                  of <strong className="text-foreground">{total}</strong> staff
                  members
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
      <StaffFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        staff={editing}
        stats={stats}
        onSaved={refresh}
      />
    </div>
  )
}
