"use client"

import { useState } from "react"
import {
  Loader2,
  MoreHorizontal,
  Pencil,
  Power,
  SearchX,
  Trash2,
  UserX,
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
import { RoleBadge, StatusBadge } from "@/components/shared/role-badge"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/lib/api"
import { avatarUrl, docId } from "@/lib/utils"

/** One-line detail per role: department · subjects · duty. */
function detailFor(person) {
  if (person.role === "teacher") {
    return person.subjects?.length
      ? person.subjects.join(" · ")
      : "Teaching Staff"
  }
  if (person.role === "support") return person.duty || "Support Services"
  if (person.role === "principal") return "Office of the Principal"
  return person.department || "Administration"
}

function RowSkeleton() {
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <Skeleton className="size-9 rounded-full" />
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Skeleton className="h-3.5 w-20" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-20 rounded-full" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-3.5 w-28" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-16 rounded-full" />
      </TableCell>
      <TableCell className="text-right">
        <Skeleton className="ml-auto h-8 w-8 rounded-lg" />
      </TableCell>
    </TableRow>
  )
}

/**
 * Staff directory table — search results, role filters and row actions.
 * Mutations (status toggle, delete) run here and notify the parent through
 * `onChanged` so the list and the quota counters refresh together.
 */
export function StaffTable({
  rows,
  loading,
  currentUserId,
  onEdit,
  onChanged,
}) {
  const [pendingDelete, setPendingDelete] = useState(null)
  const [busyId, setBusyId] = useState(null)

  const isSelf = (person) => docId(person) === currentUserId

  const toggleStatus = async (person) => {
    const id = docId(person)
    const next = person.status === "active" ? "inactive" : "active"
    setBusyId(id)
    try {
      await api.patch(`/api/staff/${id}`, { status: next })
      toast.success(
        `${person.name} is now ${next === "active" ? "active" : "inactive"}`,
      )
      onChanged?.()
    } catch (error) {
      toast.error(error.message || "Could not update this staff member")
    } finally {
      setBusyId(null)
    }
  }

  const confirmDelete = async () => {
    const person = pendingDelete
    if (!person) return
    const id = docId(person)
    setBusyId(id)
    try {
      await api.del(`/api/staff/${id}`)
      toast.success(`${person.name} removed from the staff directory`)
      setPendingDelete(null)
      onChanged?.()
    } catch (error) {
      toast.error(error.message || "Could not delete this staff member")
    } finally {
      setBusyId(null)
    }
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="overflow-x-auto">
          <Table className="min-w-[760px]">
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead>Staff member</TableHead>
                <TableHead>Employee ID</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department / subjects</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <RowSkeleton key={i} />
                ))
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-14 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center gap-2">
                      <SearchX className="size-8 text-muted-foreground/60" />
                      <p className="font-heading text-base font-bold">
                        No staff members found
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Adjust the search or filters — or add a new staff
                        member with the button above.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((person) => {
                  const id = docId(person)
                  const busy = busyId === id
                  const self = isSelf(person)

                  return (
                    <TableRow key={id}>
                      {/* ---------------------------- person --------------------------- */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img
                            src={avatarUrl(person)}
                            alt=""
                            className="size-9 shrink-0 rounded-full border border-border bg-muted object-cover"
                          />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">
                              {person.name}
                              {self && (
                                <span className="ml-1.5 text-[11px] font-medium text-muted-foreground">
                                  (you)
                                </span>
                              )}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {person.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* --------------------------- employee -------------------------- */}
                      <TableCell>
                        <span className="font-mono text-xs font-medium text-muted-foreground">
                          {person.employeeId || "—"}
                        </span>
                      </TableCell>

                      {/* ----------------------------- role ---------------------------- */}
                      <TableCell>
                        <RoleBadge role={person.role} />
                      </TableCell>

                      {/* ---------------------------- detail --------------------------- */}
                      <TableCell>
                        <p className="max-w-56 truncate text-sm text-muted-foreground">
                          {detailFor(person)}
                        </p>
                      </TableCell>

                          {/* --------------------------- status --------------------------- */}
                      <TableCell>
                        <StatusBadge
                          status={person.status}
                          label={person.status === "active" ? "Active" : "Inactive"}
                        />
                      </TableCell>

                      {/* --------------------------- actions --------------------------- */}
                      <TableCell className="text-right">
                        <div className="flex justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              aria-label={`Actions for ${person.name}`}
                              className="inline-flex size-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
                              disabled={busy}
                            >
                              {busy ? (
                                <Loader2 className="size-4 animate-spin" />
                              ) : (
                                <MoreHorizontal className="size-4" />
                              )}
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-52">
                              <DropdownMenuLabel>Manage</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => onEdit?.(person)}
                              >
                                <Pencil /> Edit record
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                disabled={self}
                                onClick={() => toggleStatus(person)}
                              >
                                <Power />
                                {person.status === "active"
                                  ? "Deactivate"
                                  : "Reactivate"}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                variant="destructive"
                                disabled={self}
                                onClick={() => setPendingDelete(person)}
                              >
                                <Trash2 /> Delete record
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        {self && (
                          <p className="mt-1 text-[10px] text-muted-foreground">
                            your account
                          </p>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* ------------------------ delete confirmation -------------------- */}
      <AlertDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading">
              Delete {pendingDelete?.name}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the record of{" "}
              <span className="font-medium text-foreground">
                {pendingDelete?.employeeId}
              </span>{" "}
              from the staff directory. They will lose access to the portal
              immediately, and the freed slot returns to the quota. This cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel disabled={Boolean(busyId)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={Boolean(busyId)}
              onClick={confirmDelete}
            >
              {busyId ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
              Delete record
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

/** Shown instead of the table when the API could not be reached. */
export function StaffTableError({ error, onRetry }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 text-center">
      <UserX className="mx-auto size-8 text-muted-foreground/60" />
      <p className="mt-3 font-heading text-base font-bold">
        Could not load the staff directory
      </p>
      <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
        {error?.message || "The school API did not respond."}
      </p>
      <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
        Try again
      </Button>
    </div>
  )
}

export default StaffTable
