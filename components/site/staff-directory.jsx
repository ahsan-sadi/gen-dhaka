"use client"

import { useMemo, useState } from "react"
import { Search, SearchX, UserRound } from "lucide-react"

import { Input } from "@/components/ui/input"
import { EmptyState } from "@/components/shared/empty-state"
import { RoleBadge } from "@/components/shared/role-badge"
import { avatarUrl, cn } from "@/lib/utils"

const FILTERS = [
  { id: "all", label: "Everyone" },
  { id: "principal", label: "Leadership" },
  { id: "admin", label: "Admin Staff" },
  { id: "teacher", label: "Teaching Staff" },
]

function StaffCard({ person }) {
  const meta =
    person.role === "admin"
      ? person.department || "Administration"
      : person.role === "teacher"
        ? (person.subjects || []).join(" · ") || "Teaching Staff"
        : person.department || "Principal's Office"

  return (
    <article className="card-hover flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card">
      {/* portrait */}
      <div className="relative h-44 w-full overflow-hidden border-b border-border bg-muted">
        <img
          src={avatarUrl({ name: person.name, image: person.image })}
          alt={person.name}
          loading="lazy"
          className="h-full w-full object-cover object-top transition-transform duration-300 hover:scale-105"
        />
        <span className="absolute top-3 left-3">
          <RoleBadge role={person.role} />
        </span>
        {person.joinedYear && (
          <span className="absolute top-3 right-3 rounded-full border border-border bg-background/90 px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground backdrop-blur">
            Since {person.joinedYear}
          </span>
        )}
      </div>

      {/* details */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-heading text-base font-bold tracking-tight text-foreground">
          {person.name}
        </h3>
        <p className="mt-0.5 truncate text-sm text-muted-foreground">{meta}</p>
        {person.qualification && (
          <p className="mt-2 text-xs text-muted-foreground">
            {person.qualification}
          </p>
        )}
        <p className="mt-auto pt-3 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          {person.employeeId}
        </p>
      </div>
    </article>
  )
}

/**
 * Public directory of the school's leadership, admin and teaching staff —
 * rendered on `/staff` with data from GET /api/staff/public.
 */
export function StaffDirectory({ staff }) {
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState("all")

  const counts = useMemo(() => {
    const c = { all: staff.length, principal: 0, admin: 0, teacher: 0 }
    for (const person of staff) c[person.role] = (c[person.role] || 0) + 1
    return c
  }, [staff])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return staff.filter((person) => {
      if (filter !== "all" && person.role !== filter) return false
      if (!q) return true
      return [
        person.name,
        person.department,
        person.qualification,
        person.employeeId,
        ...(person.subjects || []),
      ]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(q))
    })
  }, [staff, filter, query])

  return (
    <div className="space-y-6">
      {/* filter bar */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div
          className="flex flex-wrap gap-2"
          role="tablist"
          aria-label="Filter staff"
        >
          {FILTERS.map((option) => {
            const active = filter === option.id
            return (
              <button
                key={option.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(option.id)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                )}
              >
                {option.label}
                <span
                  className={cn(
                    "ml-1.5 text-xs",
                    active ? "text-primary-foreground/80" : "text-muted-foreground"
                  )}
                >
                  {counts[option.id] ?? 0}
                </span>
              </button>
            )
          })}
        </div>

        <div className="relative w-full lg:w-80">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, subject, department…"
            className="pr-9 pl-9"
            aria-label="Search staff"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <SearchX className="size-4" />
            </button>
          )}
        </div>
      </div>

      {/* grid */}
      {visible.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No staff match your search"
          description="Try a different name, subject or department — or clear the filter to see everyone."
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((person) => (
            <StaffCard key={person.id} person={person} />
          ))}
        </div>
      )}

      <p className="text-center text-xs text-muted-foreground">
        Showing {visible.length} of {staff.length} members of the school
        leadership, admin and teaching staff at BAFWWA GEN DHAKA.
      </p>
    </div>
  )
}

export default StaffDirectory
