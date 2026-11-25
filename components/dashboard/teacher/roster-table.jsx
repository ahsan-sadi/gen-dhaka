"use client"

import { SearchX, UserX } from "lucide-react"

import { Button } from "@/components/ui/button"
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
import { avatarUrl } from "@/lib/utils"

function RowSkeleton() {
  return (
    <TableRow>
      <TableCell>
        <Skeleton className="h-3.5 w-8" />
      </TableCell>
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
        <Skeleton className="h-3.5 w-24" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-3.5 w-28" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-16 rounded-full" />
      </TableCell>
    </TableRow>
  )
}

/**
 * Read-only class roster for teachers — roll number, student, guardian
 * contact and portal status. Editing lives exclusively in the Admin
 * dashboard (the API answers 403 for teacher mutations anyway).
 */
export function RosterTable({ rows, loading, emptyHint }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="overflow-x-auto">
        <Table className="min-w-[720px]">
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-14">Roll</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Guardian</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => <RowSkeleton key={i} />)
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-14 text-center">
                  <div className="mx-auto flex max-w-sm flex-col items-center gap-2">
                    <SearchX className="size-8 text-muted-foreground/60" />
                    <p className="font-heading text-base font-bold">
                      No students here
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {emptyHint ||
                        "Adjust the search or pick another class."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((student) => (
                <TableRow key={student.id || student._id}>
                  <TableCell>
                    <span className="font-mono text-xs font-medium text-muted-foreground">
                      {student.rollNo ?? "—"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src={avatarUrl(student)}
                        alt=""
                        className="size-9 shrink-0 rounded-full border border-border bg-muted object-cover"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {student.name}
                        </p>
                        <p className="truncate font-mono text-xs text-muted-foreground">
                          {student.studentId}
                          {student.className ? ` · ${student.className}` : ""}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="max-w-40 truncate text-sm text-muted-foreground">
                      {student.guardianName || "—"}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-muted-foreground">
                      {student.guardianPhone || student.phone || "—"}
                    </p>
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      status={student.status}
                      label={
                        student.status === "active" ? "Active" : "Inactive"
                      }
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

/** Shown instead of the roster when the API could not be reached. */
export function RosterTableError({ error, onRetry }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 text-center">
      <UserX className="mx-auto size-8 text-muted-foreground/60" />
      <p className="mt-3 font-heading text-base font-bold">
        Could not load your roster
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

export default RosterTable
