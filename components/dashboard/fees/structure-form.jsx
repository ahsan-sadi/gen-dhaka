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

const EMPTY = {
  classId: "",
  monthlyFee: "",
  admissionFee: "",
  transportFee: "",
  notes: "",
}

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

function toFormValues(target) {
  const structure = target?.structure || null
  if (!target) return { ...EMPTY }
  return {
    classId: String(target.classId || ""),
    monthlyFee: structure ? String(structure.monthlyFee ?? "") : "",
    admissionFee: structure ? String(structure.admissionFee ?? "") : "",
    transportFee: structure ? String(structure.transportFee ?? "") : "",
    notes: structure?.notes || "",
  }
}

const readMoney = (value) =>
  value === "" ? 0 : Number(value)

/**
 * Sets what a class owes: monthly tuition plus one-time admission and
 * optional transport fees. Editing an existing setup re-uses the same
 * endpoint (it upserts), so this dialog always PUTs.
 *
 * `target` — null for "add", or the class row ({ classId, structure }).
 * `options` — every class row returned by GET /api/fees/structures.
 */
export function StructureFormDialog({ open, onOpenChange, target, options = [], onSaved }) {
  const isEdit = Boolean(target)
  const [form, setForm] = useState(() => toFormValues(target))
  const [errors, setErrors] = useState({})
  const [pending, setPending] = useState(false)

  const set = (field) => (event) =>
    setForm((prev) => ({ ...prev, [field]: event.target.value }))

  useEffect(() => {
    if (open) {
      setForm(toFormValues(target))
      setErrors({})
      setPending(false)
    }
  }, [open, target])

  const chosen = options.find((row) => row.classId === form.classId)

  const validate = () => {
    const next = {}
    if (!form.classId) next.classId = "Choose a class."
    const monthly = readMoney(form.monthlyFee)
    const admission = readMoney(form.admissionFee)
    const transport = readMoney(form.transportFee)
    if (!Number.isFinite(monthly) || monthly < 0) {
      next.monthlyFee = "Enter an amount (0 is allowed for free classes)."
    }
    if (!Number.isFinite(admission) || admission < 0) {
      next.admissionFee = "Enter an amount (use 0 if none)."
    }
    if (!Number.isFinite(transport) || transport < 0) {
      next.transportFee = "Enter an amount (use 0 if none)."
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!validate()) return
    setPending(true)

    try {
      await api.put(`/api/fees/structures/${form.classId}`, {
        monthlyFee: readMoney(form.monthlyFee),
        admissionFee: readMoney(form.admissionFee),
        transportFee: readMoney(form.transportFee),
        notes: form.notes.trim(),
      })
      toast.success(
        `Fee structure saved for ${chosen?.className || "the class"}`,
      )
      onSaved?.()
      onOpenChange(false)
    } catch (error) {
      toast.error(error.message || "Could not save the fee structure")
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading">
            {isEdit ? "Edit fee structure" : "Set a fee structure"}
          </DialogTitle>
          <DialogDescription>
            The monthly fee becomes what every student of this class owes
            each month — dues recalculate immediately.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <Field
            label="Class"
            htmlFor="structure-class"
            error={errors.classId}
            hint={
              isEdit
                ? "Change the amounts below, then save."
                : "Pick the class this fee applies to."
            }
          >
            <NativeSelect
              id="structure-class"
              value={form.classId}
              onChange={set("classId")}
              className="w-full"
              disabled={isEdit}
            >
              <NativeSelectOption value="">Choose a class…</NativeSelectOption>
              {options.map((row) => (
                <NativeSelectOption key={row.classId} value={row.classId}>
                  {row.className} — {row.sessionName}
                  {row.structure ? "" : " (no fee set)"}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field
              label="Monthly fee (৳)"
              htmlFor="structure-monthly"
              error={errors.monthlyFee}
              hint="Per month, per student"
            >
              <Input
                id="structure-monthly"
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={form.monthlyFee}
                onChange={set("monthlyFee")}
                placeholder="e.g. 3500"
              />
            </Field>

            <Field
              label="Admission fee (৳)"
              htmlFor="structure-admission"
              error={errors.admissionFee}
              hint="One-time, at joining"
            >
              <Input
                id="structure-admission"
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={form.admissionFee}
                onChange={set("admissionFee")}
                placeholder="e.g. 5000"
              />
            </Field>

            <Field
              label="Transport fee (৳)"
              htmlFor="structure-transport"
              error={errors.transportFee}
              hint="Monthly, if applicable"
            >
              <Input
                id="structure-transport"
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={form.transportFee}
                onChange={set("transportFee")}
                placeholder="0"
              />
            </Field>
          </div>

          <Field
            label="Notes (optional)"
            htmlFor="structure-notes"
            hint="Shown to students on their My Fees page."
          >
            <Textarea
              id="structure-notes"
              rows={2}
              value={form.notes}
              onChange={set("notes")}
              placeholder="e.g. Payable by the 10th at the accounts office"
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
              {isEdit ? "Save changes" : "Set fee structure"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default StructureFormDialog
