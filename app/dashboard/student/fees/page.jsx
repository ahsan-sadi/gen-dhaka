"use client"

import {
  BadgeCheck,
  CalendarRange,
  HandCoins,
  Receipt,
  Wallet,
} from "lucide-react"

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useApi } from "@/hooks/use-api"
import { useRequireAuth } from "@/lib/auth-context"
import {
  FEE_METHOD_LABELS,
  FEE_STATUS_LABELS,
  formatDate,
  formatMoney,
  formatMonth,
} from "@/lib/constants"

export default function StudentFeesPage() {
  useRequireAuth(["student"])

  const query = useApi("/api/fees/me")

  const data = query.data
  const items = data?.items || []
  const loading = query.loading && !query.data

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Student Portal"
        title="My Fees"
        description="Your monthly fee, what you have paid this month, and every receipt the accounts office has issued for you."
      />

      <BackendAlert error={query.error} />

      {/* ------------------------------ stats ----------------------------- */}
      {loading ? (
        <StatsGridSkeleton count={4} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Monthly fee"
            value={formatMoney(data?.monthlyFee ?? 0)}
            sublabel={data?.className ? `${data.className} class` : "Your class"}
            icon={Wallet}
            tone="sky"
          />
          <StatCard
            label="Paid this month"
            value={formatMoney(data?.paid ?? 0)}
            sublabel={formatMonth(data?.month)}
            icon={HandCoins}
            tone="emerald"
          />
          <StatCard
            label="Due this month"
            value={formatMoney(data?.due ?? 0)}
            sublabel={
              data?.status === "paid"
                ? "Fully settled — thank you"
                : "Pay at the accounts office"
            }
            icon={CalendarRange}
            tone={
              (data?.due ?? 0) > 0 ? "rose" : "emerald"
            }
          />
          <StatCard
            label="Receipts issued"
            value={data?.total ?? 0}
            sublabel="Payments recorded for you"
            icon={Receipt}
            tone="violet"
          />
        </div>
      )}

      {/* --------------------------- fee breakdown ------------------------ */}
      {data && (
        <section className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-heading text-lg font-extrabold tracking-tight">
                Fee breakdown
              </h2>
              <p className="text-xs text-muted-foreground">
                Set by the school office for your class
              </p>
            </div>
            <StatusBadge
              status={data.status}
              label={FEE_STATUS_LABELS[data.status] || data.status}
            />
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-xs font-medium text-muted-foreground">
                Monthly tuition
              </p>
              <p className="mt-1 font-heading text-2xl font-extrabold tracking-tight">
                {formatMoney(data.monthlyFee)}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Due each month
              </p>
            </div>
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-xs font-medium text-muted-foreground">
                Admission fee (one-time)
              </p>
              <p className="mt-1 font-heading text-2xl font-extrabold tracking-tight">
                {formatMoney(data.admissionFee)}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Charged at joining
              </p>
            </div>
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-xs font-medium text-muted-foreground">
                Transport fee (monthly)
              </p>
              <p className="mt-1 font-heading text-2xl font-extrabold tracking-tight">
                {formatMoney(data.transportFee)}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {data.transportFee > 0 ? "Optional route charge" : "Not applicable"}
              </p>
            </div>
          </div>

          {data.notes && (
            <p className="mt-4 flex items-start gap-2 rounded-xl bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
              <BadgeCheck className="mt-0.5 size-4 shrink-0 text-primary" />
              {data.notes}
            </p>
          )}

          {data.due > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 dark:border-rose-500/30 dark:bg-rose-500/10">
              <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">
                {formatMoney(data.due)} due for {formatMonth(data.month)}
              </p>
              <p className="text-xs text-rose-600/80 dark:text-rose-300/80">
                Settle it at the accounts office — receipts appear below
                instantly.
              </p>
            </div>
          )}
        </section>
      )}

      {/* ----------------------------- history ---------------------------- */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-heading text-lg font-extrabold tracking-tight">
            Payment history
          </h2>
          {query.loading && query.data && <LoadingRow label="Refreshing…" />}
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead>Month</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Received on</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 5 }).map((__, j) => (
                      <TableCell key={j}>
                        <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12">
                    <EmptyState
                      icon={Receipt}
                      title="No payments recorded yet"
                      description="As soon as the accounts office records a receipt for you, it will show up here."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                items.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">
                      {formatMonth(payment.month)}
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
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(payment.paidAt)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 flex justify-end">
          <DbHint />
        </div>
      </section>
    </div>
  )
}
