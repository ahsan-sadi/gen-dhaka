"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"
import {
  FEE_METHODS,
  FEE_METHOD_LABELS,
  currentMonth,
} from "@/lib/constants"

const EMPTY = {
  studentId: "",
  month: "",
  amount: "",
  method: "cash",
  reference: "",
  note: "",
  paidAt: "",
}

const MONTH_RX = /^\d{4}-(0[1-9]|1[0-2])$/

function Field({ label, htmlFor, error, hint, children, className }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
      {!error && hint && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  )
}

/**
 * Receipt composer for the Admin dashboard — books one payment against
 * one student and one fee month (YYYY-MM).
 */
export function PaymentFormDialog({ open, onOpenChange, month, onSaved }) {
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [pending, setPending] = useState(false)
  const [students, setStudents] = useState([])
  const [studentsLoading, setStudentsLoading] = useState(false)
  const [filter, setFilter] = useState("")

  const set = (field) => (event) =>
    setForm((prev) => ({ ...prev, [field]: event.target.value }))

  useEffect(() => {
    if (open) {
      setForm({
        ...EMPTY,
        month: month || currentMonth(),
        paidAt: new Date().toISOString().slice(0, 10),
      })
      setErrors({})
      setPending(false)
      setFilter("")
    }
  }, [open, month])

  // Every active student, paged (max 10 pages = 1000 students).
  useEffect(() => {
    if (!open) return
    let active = true
    setStudentsLoading(true)
    ;(async () => {
      try {
        const all = []
        for (let page = 1; page <= 10; page += 1) {
          const res = await api.get(
            `/api/students?status=active&limit=100&page=${page}`,
          )
          const items = res?.items || []
          all.push(...items)
          if (!items.length || page >= (res?.pages || 1)) break
        }
        if (active) setStudents(all)
      } catch {
        /* surfaced by the page-level alert */
      } finally {
        if (active) setStudentsLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [open])

  // Client-side narrowing so large schools stay easy to pick from.
  const needle = filter.trim().toLowerCase()
  const matches = !needle
    ? students
    : students.filter((student) => {
        const name = (student.name || "").toLowerCase()
        const idNo = (student.studentId || "").toLowerCase()
        const klass = (student.className || "").toLowerCase()
        return (
          name.includes(needle) ||
          idNo.includes(needle) ||
          klass.includes(needle)
        )
      })

  // The current selection stays visible even while filtered out.
  const selected = students.find((s) => String(s.id) === form.studentId)
  const options =
    selected && !matches.includes(selected) ? [selected, ...matches] : matches

  const validate = () => {
    const next = {}
    if (!form.studentId) next.studentId = "Choose the student who paid."
    if (!MONTH_RX.test(form.month)) next.month = "Month must be YYYY-MM."
    const amount = Number(form.amount)
    if (!form.amount || !Number.isFinite(amount) || amount <= 0) {
      next.amount = "Enter an amount greater than 0."
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!validate()) return
    setPending(true)

    try {
      const saved = await api.post("/api/fees/payments", {
        studentId: form.studentId,
        month: form.month,
        amount: Number(form.amount),
        method: form.method,
        reference: form.reference.trim(),
        note: form.note.trim(),
        paidAt: form.paidAt,
      })
      toast.success(
        `Receipt recorded — ৳${saved.amount} from ${saved.studentName}`,
      )
      onSaved?.()
      onOpenChange(false)
    } catch (error) {
      toast.error(error.message || "Could not record this payment")
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading">Record a payment</DialogTitle>
          <DialogDescription>
            Book a receipt against one student and one fee month. Students
            see it instantly under My Fees.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* ---------------------- student picker ----------------------- */}
          <Field
            label="Student"
            htmlFor="payment-student"
            error={errors.studentId}
            hint={
              studentsLoading
                ? "Loading students…"
                : `${students.length} active students`
            }
          >
            {students.length > 6 && (
              <Input
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
                placeholder="Narrow the list by name, ID or class…"
                className="mb-2"
                aria-label="Filter students"
                autoComplete="off"
              />
            )}
            <NativeSelect
              id="payment-student"
              value={form.studentId}
              onChange={set("studentId")}
              className="w-full"
              disabled={studentsLoading && !students.length}
            >
              <NativeSelectOption value="">Choose a student…</NativeSelectOption>
              {options.map((student) => (
                <NativeSelectOption key={student.id} value={String(student.id)}>
                  {student.name} — {student.className || "No class"} (
                  {student.studentId})
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Fee month" htmlFor="payment-month" error={errors.month}>
              <Input
                id="payment-month"
                type="month"
                value={form.month}
                onChange={set("month")}
              />
            </Field>

            <Field
              label="Amount (৳)"
              htmlFor="payment-amount"
              error={errors.amount}
            >
              <Input
                id="payment-amount"
                type="number"
                min="1"
                step="0.01"
                inputMode="decimal"
                value={form.amount}
                onChange={set("amount")}
                placeholder="e.g. 3500"
              />
            </Field>

            <Field label="Method" htmlFor="payment-method">
              <NativeSelect
                id="payment-method"
                value={form.method}
                onChange={set("method")}
                className="w-full"
              >
                {FEE_METHODS.map((method) => (
                  <NativeSelectOption key={method} value={method}>
                    {FEE_METHOD_LABELS[method]}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>

            <Field
              label="Received on"
              htmlFor="payment-date"
              hint="Date on the receipt."
            >
              <Input
                id="payment-date"
                type="date"
                value={form.paidAt}
                onChange={set("paidAt")}
              />
            </Field>
          </div>

          <Field
            label="Reference (optional)"
            htmlFor="payment-reference"
            hint="Transaction ID, cheque number or receipt slip."
          >
            <Input
              id="payment-reference"
              value={form.reference}
              onChange={set("reference")}
              placeholder="e.g. TRX98765"
              autoComplete="off"
            />
          </Field>

          <Field label="Note (optional)" htmlFor="payment-note">
            <Textarea
              id="payment-note"
              rows={2}
              value={form.note}
              onChange={set("note")}
              placeholder="Anything the accounts office should remember"
            />
          </Field>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="size-4 animate-spin" />}
              Record payment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default PaymentFormDialog
