"use client"

import { useState } from "react"
import {
  Loader2,
  Megaphone,
  MoreHorizontal,
  Pencil,
  SearchX,
  Trash2,
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
import { StatusBadge } from "@/components/shared/role-badge"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/lib/api"
import { docId } from "@/lib/utils"
import {
  NOTICE_AUDIENCE_LABELS,
  NOTICE_PRIORITY_LABELS,
} from "@/lib/constants"

function RowSkeleton() {
  return (
    <TableRow>
      <TableCell>
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-72 max-w-full" />
        </div>
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-20 rounded-full" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-16 rounded-full" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-3.5 w-24" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-3.5 w-28" />
      </TableCell>
      <TableCell className="text-right">
        <Skeleton className="ml-auto h-8 w-8 rounded-lg" />
      </TableCell>
    </TableRow>
  )
}

/** Admin notice directory: audience, priority, publish date and actions. */
export function NoticesTable({ rows, loading, onEdit, onChanged }) {
  const [pendingDelete, setPendingDelete] = useState(null)
  const [busyId, setBusyId] = useState(null)

  const confirmDelete = async () => {
    const notice = pendingDelete
    if (!notice) return
    const id = docId(notice)
    setBusyId(id)
    try {
      await api.del(`/api/notices/${id}`)
      toast.success(`“${notice.title}” deleted`)
      setPendingDelete(null)
      onChanged?.()
    } catch (error) {
      toast.error(error.message || "Could not delete this notice")
    } finally {
      setBusyId(null)
    }
  }

  const priorityTone = (priority) =>
    priority === "urgent"
      ? "text-rose-600 dark:text-rose-400"
      : priority === "important"
        ? "text-amber-600 dark:text-amber-400"
        : "text-muted-foreground"

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="overflow-x-auto">
          <Table className="min-w-[860px]">
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead>Notice</TableHead>
                <TableHead>Addressed to</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Publish date</TableHead>
                <TableHead>Published by</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <RowSkeleton key={i} />
                ))
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-14 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center gap-2">
                      <SearchX className="size-8 text-muted-foreground/60" />
                      <p className="font-heading text-base font-bold">
                        No notices found
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Adjust the search or publish a new notice with the
                        button above.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((notice) => {
                  const id = docId(notice)
                  const busy = busyId === id

                  return (
                    <TableRow key={id}>
                      {/* ---------------------------- notice --------------------------- */}
                      <TableCell>
                        <div className="flex items-start gap-2.5">
                          <Megaphone
                            className={`mt-0.5 size-4 shrink-0 ${priorityTone(notice.priority)}`}
                          />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">
                              {notice.title}
                            </p>
                            <p className="line-clamp-1 max-w-md text-xs text-muted-foreground">
                              {notice.body}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* -------------------------- audience -------------------------- */}
                      <TableCell>
                        <StatusBadge
                          status={
                            notice.audience === "students"
                              ? "active"
                              : notice.audience === "teachers"
                                ? "teacher"
                                : notice.audience === "staff"
                                  ? "admin"
                                  : "principal"
                          }
                          label={NOTICE_AUDIENCE_LABELS[notice.audience]}
                        />
                      </TableCell>

                          {/* -------------------------- priority -------------------------- */}
                      <TableCell>
                        <span
                          className={`text-xs font-semibold ${priorityTone(notice.priority)}`}
                        >
                          {NOTICE_PRIORITY_LABELS[notice.priority]}
                        </span>
                      </TableCell>

                      {/* ---------------------------- date ---------------------------- */}
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {notice.date || "—"}
                        </span>
                      </TableCell>

                      {/* -------------------------- publisher ------------------------- */}
                      <TableCell>
                        <p className="max-w-36 truncate text-sm text-muted-foreground">
                          {notice.createdByName || "Admin office"}
                        </p>
                      </TableCell>

                      {/* --------------------------- actions -------------------------- */}
                      <TableCell className="text-right">
                        <div className="flex justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              aria-label={`Actions for ${notice.title}`}
                              className="inline-flex size-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
                              disabled={busy}
                            >
                              {busy ? (
                                <Loader2 className="size-4 animate-spin" />
                              ) : (
                                <MoreHorizontal className="size-4" />
                              )}
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuGroup>
                                <DropdownMenuLabel>Manage</DropdownMenuLabel>
                              </DropdownMenuGroup>
                              <DropdownMenuItem
                                onClick={() => onEdit?.(notice)}
                              >
                                <Pencil className="size-4" /> Edit notice
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => setPendingDelete(notice)}
                              >
                                <Trash2 className="size-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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

      {/* --------------------------- delete confirm -------------------------- */}
      <AlertDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading">
              Delete this notice?
            </AlertDialogTitle>
            <AlertDialogDescription>
              “{pendingDelete?.title}” will be removed from every dashboard it
              appears on. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busyId}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={Boolean(busyId)}
              onClick={confirmDelete}
            >
              {busyId && <Loader2 className="size-4 animate-spin" />}
              Delete notice
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export const NoticesTableError = ({ error, onRetry }) =>
  error ? (
    <Button variant="outline" onClick={onRetry}>
      Try again ({error.message})
    </Button>
  ) : null

export default NoticesTable
