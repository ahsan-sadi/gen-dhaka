"use client"

import { useEffect, useState } from "react"
import { Megaphone, Plus, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import PageHeader from "@/components/shared/page-header"
import { BackendAlert, DbHint } from "@/components/dashboard/status"
import NoticeFormDialog from "@/components/dashboard/notices/notice-form"
import NoticesTable from "@/components/dashboard/notices/notices-table"
import { useApi } from "@/hooks/use-api"
import { useRequireAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"
import { NOTICE_AUDIENCES, NOTICE_AUDIENCE_LABELS } from "@/lib/constants"

const PAGE_SIZE = 10

export default function AdminNoticesPage() {
  useRequireAuth(["admin"])

  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [audienceFilter, setAudienceFilter] = useState("all")
  const [page, setPage] = useState(1)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim())
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  const params = new URLSearchParams()
  if (audienceFilter !== "all") params.set("audience", audienceFilter)
  if (debouncedQuery) params.set("q", debouncedQuery)
  params.set("page", String(page))
  params.set("limit", String(PAGE_SIZE))

  const listQuery = useApi(`/api/notices?${params.toString()}`)

  const rows = listQuery.data?.items || []
  const total = listQuery.data?.total ?? 0
  const pages = listQuery.data?.pages ?? 1

  const refresh = () => listQuery.refetch()

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (notice) => {
    setEditing(notice)
    setFormOpen(true)
  }

  const changeAudience = (value) => {
    setAudienceFilter(value)
    setPage(1)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Control Center"
        title="Notices"
        description="Publish announcements to the Principal, Teachers and Students dashboards in one action — targeted by audience, priority or a single class."
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" /> Publish notice
          </Button>
        }
      />

      <BackendAlert error={listQuery.error} />

      {/* ------------------------------ filters ----------------------------- */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search notices…"
            className="w-64 pl-9"
            aria-label="Search notices"
          />
        </div>

        <div className="flex flex-wrap gap-1.5 rounded-xl border border-border bg-card p-1">
          {[{ id: "all", label: "Everyone" }, ...NOTICE_AUDIENCES.filter((a) => a !== "all").map((a) => ({ id: a, label: NOTICE_AUDIENCE_LABELS[a] }))].map(
            (filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => changeAudience(filter.id)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                  audienceFilter === filter.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {filter.label}
              </button>
            ),
          )}
        </div>

        <span className="ml-auto text-sm text-muted-foreground">
          {total} {total === 1 ? "notice" : "notices"}
        </span>
      </div>

      {/* ------------------------------- list ------------------------------- */}
      <NoticesTable
        rows={rows}
        loading={listQuery.loading}
        onEdit={openEdit}
        onChanged={refresh}
      />

      {/* --------------------------- pagination ---------------------------- */}
      {pages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(event) => {
                  event.preventDefault()
                  setPage((p) => Math.max(1, p - 1))
                }}
                aria-disabled={page <= 1}
                className={cn(page <= 1 && "pointer-events-none opacity-50")}
              />
            </PaginationItem>
            {Array.from({ length: pages }).map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  href="#"
                  isActive={page === i + 1}
                  onClick={(event) => {
                    event.preventDefault()
                    setPage(i + 1)
                  }}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(event) => {
                  event.preventDefault()
                  setPage((p) => Math.min(pages, p + 1))
                }}
                aria-disabled={page >= pages}
                className={cn(page >= pages && "pointer-events-none opacity-50")}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <Megaphone className="size-3.5" /> Published notices appear instantly
          on each addressed dashboard.
        </p>
        <DbHint />
      </div>

      {/* ------------------------------- form ------------------------------- */}
      <NoticeFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        notice={editing}
        onSaved={refresh}
      />
    </div>
  )
}
