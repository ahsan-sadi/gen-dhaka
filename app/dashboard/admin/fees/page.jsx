"use client"

import { useState } from "react"
import {
  Banknote,
  CalendarRange,
  HandCoins,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  Receipt,
  Search,
  SearchX,
  Trash2,
  Wallet,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import PageHeader from "@/components/shared/page-header"
import StatCard from "@/components/shared/stat-card"
import { StatsGridSkeleton } from "@/components/shared/skeletons"
import { EmptyState } from "@/components/shared/empty-state"
import { StatusBadge } from "@/components/shared/role-badge"
import {
  BackendAlert,
  DbHint,
  LoadingRow,
} from "@/components/dashboard/status"
import PaymentFormDialog from "@/components/dashboard/fees/payment-form"
import StructureFormDialog from "@/components/dashboard/fees/structure-form"
import { useApi } from "@/hooks/use-api"
import { useRequireAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import {
  FEE_METHOD_LABELS,
  FEE_STATUS_LABELS,
  currentMonth,
  formatDate,
  formatMoney,
  formatMonth,
} from "@/lib/constants"
import { cn, docId } from "@/lib/utils"

const MONTH_RX = /^\d{4}-(0[1-9]|1[0-2])$/

export default function AdminFeesPage() {
  useRequireAuth(["admin"])

  /* ------------------------------- state ------------------------------ */
  const [month, setMonth] = useState(currentMonth)
  const [query, setQuery] = useState("")
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [structureOpen, setStructureOpen] = useState(false)
  const [structureTarget, setStructureTarget] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [busy, setBusy] = useState(false)

  /* ------------------------------ queries ----------------------------- */
  const duesQuery = useApi(
    `/api/fees/dues?month=${encodeURIComponent(month)}`,
  )
  const paymentsQuery = useApi(
    `/api/fees/payments?month=${encodeURIComponent(month)}`,
  )
  const structuresQuery = useApi("/api/fees/structures")

  const dues = duesQuery.data?.items || []
  const totals = duesQuery.data?.totals || null
  const payments = paymentsQuery.data?.items || []
  const classes = structuresQuery.data?.items || []

  const refresh = () => {
    duesQuery.refetch()
    paymentsQuery.refetch()
    structuresQuery.refetch()
  }

  const error =
    duesQuery.error || paymentsQuery.error || structuresQuery.error
  const loadingDues = duesQuery.loading && !duesQuery.data
  const loadingPayments = paymentsQuery.loading && !paymentsQuery.data
  const loadingStructures = structuresQuery.loading && !structuresQuery.data

  /* --------------------------- client filter -------------------------- */
  const needle = query.trim().toLowerCase()
  const visibleDues = !needle
    ? dues
    : dues.filter((row) => {
        const name = (row.name || "").toLowerCase()
        const idNo = (row.studentIdNo || "").toLowerCase()
        const klass = (row.className || "").toLowerCase()
        return (
          name.includes(needle) ||
          idNo.includes(needle) ||
          klass.includes(needle)
        )
      })

  /* ------------------------------ dialogs ----------------------------- */
  const openPayment = () => setPaymentOpen(true)

  const openNewStructure = () => {
    setStructureTarget(null)
    setStructureOpen(true)
  }

  const openEditStructure = (row) => {
    setStructureTarget(row)
    setStructureOpen(true)
  }

  const confirmDelete = async () => {
    if (!pendingDelete) return
    setBusy(true)
    try {
      if (pendingDelete.kind === "payment") {
        await api.del(`/api/fees/payments/${pendingDelete.id}`)
        toast.success("Payment record voided")
      } else {
        await api.del(`/api/fees/structures/${pendingDelete.id}`)
        toast.success("Fee structure removed")
      }
      setPendingDelete(null)
      refresh()
    } catch (err) {
      toast.error(err.message || "Could not delete that record")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Control Center"
        title="Fees & Payments"
        description="Set the monthly fee for every class, collect receipts month by month, and watch dues clear in real time — students see the same numbers under My Fees."
        actions={
          <>
            <Button variant="outline" onClick={openNewStructure}>
              <Plus className="size-4" /> Set fee structure
            </Button>
            <Button onClick={openPayment}>
              <HandCoins className="size-4" /> Record payment
            </Button>
          </>
        }
      />

      <BackendAlert error={error} />

      {/* ---------------------------- month bar --------------------------- */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-border bg-card px-5 py-3.5">
        <span className="flex items-center gap-2 text-sm font-medium">
          <CalendarRange className="size-4 text-primary" />
          Fee month
        </span>
        <Input
          id="fees-month"
          type="month"
          value={month}
          onChange={(event) => setMonth(event.target.value)}
          className="w-44"
          aria-label="Fee month"
        />
        <span className="text-sm font-semibold">
          {MONTH_RX.test(month) ? formatMonth(month) : "—"}
        </span>
        <span className="ml-auto text-xs text-muted-foreground">
          Dues and receipts below follow the selected month.
        </span>
      </div>

      {/* ------------------------------ stats ----------------------------- */}
      {loadingDues ? (
        <StatsGridSkeleton count={4} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Expected"
            value={totals ? formatMoney(totals.expected) : "—"}
            sublabel={`${totals?.students ?? 0} students in ${formatMonth(month)}`}
            icon={Banknote}
            tone="sky"
          />
          <StatCard
            label="Collected"
            value={totals ? formatMoney(totals.paid) : "—"}
            sublabel={`${totals?.paidCount ?? 0} students settled`}
            icon={HandCoins}
            tone="emerald"
          />
          <StatCard
            label="Outstanding"
            value={totals ? formatMoney(totals.due) : "—"}
            sublabel={`${totals?.dueCount ?? 0} students yet to pay`}
            icon={Wallet}
            tone={totals && totals.due > 0 ? "rose" : "emerald"}
          />
          <StatCard
            label="Fee setups"
            value={`${classes.filter((row) => row.structure).length} / ${classes.length}`}
            sublabel="Classes with a fee structure"
            icon={Receipt}
            tone="violet"
          />
        </div>
      )}

      {/* ------------------------------- dues ----------------------------- */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-heading text-lg font-extrabold tracking-tight">
              Dues for {MONTH_RX.test(month) ? formatMonth(month) : "—"}
            </h2>
            <p className="text-xs text-muted-foreground">
              Expected = the class&apos;s monthly fee · Paid = receipts booked
              for this month
            </p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name, ID or class…"
              className="pr-3 pl-9"
              aria-label="Search dues"
            />
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead>Student</TableHead>
                <TableHead>Class</TableHead>
                <TableHead className="text-right">Expected</TableHead>
                <TableHead className="text-right">Paid</TableHead>
                <TableHead className="text-right">Due</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingDues ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((__, j) => (
                      <TableCell key={j}>
                        <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : visibleDues.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12">
                    <EmptyState
                      icon={SearchX}
                      title={needle ? "No matching students" : "No students yet"}
                      description={
                        needle
                          ? "Adjust the search — it looks for name, student ID or class."
                          : "Add students from the Students module and their dues will appear here."
                      }
                    />
                  </TableCell>
                </TableRow>
              ) : (
                visibleDues.map((row) => (
                  <TableRow key={row.studentId}>
                    <TableCell>
                      <p className="text-sm font-semibold">{row.name}</p>
                      <p className="font-mono text-[11px] text-muted-foreground">
                        {row.studentIdNo || "—"}
                      </p>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {row.className || "No class"}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatMoney(row.expected)}
                    </TableCell>
                    <TableCell className="text-right font-medium text-emerald-600 dark:text-emerald-400">
                      {formatMoney(row.paid)}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right font-semibold",
                        row.due > 0
                          ? "text-rose-600 dark:text-rose-400"
                          : "text-muted-foreground",
                      )}
                    >
                      {formatMoney(row.due)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        status={row.status}
                        label={FEE_STATUS_LABELS[row.status] || row.status}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {!loadingDues && visibleDues.length > 0 && (
          <div className="mt-3 flex justify-end text-xs text-muted-foreground">
            {visibleDues.length} of {dues.length} students
          </div>
        )}
      </section>

      {/* ---------------------------- structures -------------------------- */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-heading text-lg font-extrabold tracking-tight">
              Fee structures by class
            </h2>
            <p className="text-xs text-muted-foreground">
              One setup per class — monthly, admission and transport fees
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={openNewStructure}>
            <Plus className="size-4" /> Set fee
          </Button>
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead>Class</TableHead>
                <TableHead>Session</TableHead>
                <TableHead className="text-right">Monthly</TableHead>
                <TableHead className="text-right">Admission</TableHead>
                <TableHead className="text-right">Transport</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingStructures ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((__, j) => (
                      <TableCell key={j}>
                        <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : classes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12">
                    <EmptyState
                      icon={CalendarRange}
                      title="No classes yet"
                      description="Create the sessions and classes first — then each class can be given a fee structure here."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                classes.map((row) => {
                  const structure = row.structure
                  return (
                    <TableRow key={row.classId}>
                      <TableCell>
                        <p className="text-sm font-semibold">{row.className}</p>
                        {!structure && (
                          <p className="text-[11px] text-amber-600 dark:text-amber-400">
                            No fee set
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {row.sessionName || "—"}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {structure
                          ? formatMoney(structure.monthlyFee)
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {structure
                          ? formatMoney(structure.admissionFee)
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {structure
                          ? formatMoney(structure.transportFee)
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              aria-label={`Actions for ${row.className}`}
                              className="inline-flex size-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
                            >
                              <MoreHorizontal className="size-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-52">
                              <DropdownMenuGroup>
                                <DropdownMenuLabel>Manage</DropdownMenuLabel>
                              </DropdownMenuGroup>
                              <DropdownMenuItem
                                onClick={() => openEditStructure(row)}
                              >
                                <Pencil />{" "}
                                {structure ? "Edit fee" : "Set fee"}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                variant="destructive"
                                disabled={!structure}
                                onClick={() =>
                                  setPendingDelete({
                                    kind: "structure",
                                    id: row.classId,
                                    label: row.className,
                                  })
                                }
                              >
                                <Trash2 /> Remove structure
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
      </section>

      {/* ----------------------------- receipts --------------------------- */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-heading text-lg font-extrabold tracking-tight">
              Receipts
            </h2>
            <p className="text-xs text-muted-foreground">
              Payments recorded for{" "}
              {MONTH_RX.test(month) ? formatMonth(month) : "the selected month"}
            </p>
          </div>
          {paymentsQuery.loading && paymentsQuery.data && (
            <LoadingRow label="Refreshing…" />
          )}
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead>Student</TableHead>
                <TableHead>Class</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Received</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingPayments ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((__, j) => (
                      <TableCell key={j}>
                        <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-12">
                    <EmptyState
                      icon={Receipt}
                      title="No payments for this month"
                      description="Record a payment with the button in the page header — it lands here and clears the student's dues instantly."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((payment) => (
                  <TableRow key={docId(payment)}>
                    <TableCell>
                      <p className="text-sm font-semibold">
                        {payment.studentName || "Unknown student"}
                      </p>
                      <p className="font-mono text-[11px] text-muted-foreground">
                        {payment.studentIdNo || "—"}
                      </p>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {payment.className || "—"}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatMoney(payment.amount)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {FEE_METHOD_LABELS[payment.method] || payment.method}
                    </TableCell>
                    <TableCell className="max-w-40 truncate font-mono text-xs text-muted-foreground">
                      {payment.reference || payment.note || "—"}
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{formatDate(payment.paidAt)}</p>
                      <p className="text-[11px] text-muted-foreground">
                        by {payment.recordedByName || "accounts"}
                      </p>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            aria-label={`Actions for payment ${payment.reference || docId(payment)}`}
                            className="inline-flex size-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
                          >
                            <MoreHorizontal className="size-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuGroup>
                              <DropdownMenuLabel>Manage</DropdownMenuLabel>
                            </DropdownMenuGroup>
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() =>
                                setPendingDelete({
                                  kind: "payment",
                                  id: docId(payment),
                                  label: `${formatMoney(payment.amount)} from ${payment.studentName}`,
                                })
                              }
                            >
                              <Trash2 /> Void payment
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      <DbHint />

      {/* ----------------------------- dialogs ---------------------------- */}
      <PaymentFormDialog
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        month={month}
        onSaved={refresh}
      />

      <StructureFormDialog
        open={structureOpen}
        onOpenChange={setStructureOpen}
        target={structureTarget}
        options={classes}
        onSaved={refresh}
      />

      <AlertDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => {
          if (!open && !busy) setPendingDelete(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading">
              {pendingDelete?.kind === "payment"
                ? "Void this payment?"
                : "Remove this fee structure?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete?.kind === "payment" ? (
                <>
                  The receipt{" "}
                  <span className="font-medium text-foreground">
                    {pendingDelete?.label}
                  </span>{" "}
                  will be deleted and the student&apos;s dues for the month
                  will go back up. This cannot be undone.
                </>
              ) : (
                <>
                  Students of{" "}
                  <span className="font-medium text-foreground">
                    {pendingDelete?.label}
                  </span>{" "}
                  will owe ৳0 monthly until a new structure is set. Payments
                  already recorded are not affected.
                </>
              )}
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
              {pendingDelete?.kind === "payment"
                ? "Void payment"
                : "Remove structure"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
