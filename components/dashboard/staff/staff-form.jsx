"use client"

import { useEffect, useState } from "react"
import { Loader2, Save, UserPlus } from "lucide-react"
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
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { api } from "@/lib/api"
import {
  DEPARTMENTS,
  STAFF_QUOTAS,
  SUPPORT_DUTIES,
  TEACHER_SUBJECTS,
} from "@/lib/constants"
import { cn } from "@/lib/utils"

const EMPTY = {
  name: "",
  email: "",
  phone: "",
  role: "teacher",
  department: "",
  subjects: [],
  duty: "",
  qualification: "",
  gender: "F",
  dateOfBirth: "",
  joiningDate: "",
  address: "",
  salary: "",
  status: "active",
  password: "",
}

const GENDERS = ["F", "M"]

function toFormValues(staff) {
  if (!staff) return { ...EMPTY }
  return {
    name: staff.name || "",
    email: staff.email || "",
    phone: staff.phone || "",
    role: staff.role || "teacher",
    department: staff.department || "",
    subjects: Array.isArray(staff.subjects) ? staff.subjects : [],
    duty: staff.duty || "",
    qualification: staff.qualification || "",
    gender: staff.gender === "M" ? "M" : "F",
    dateOfBirth: staff.dateOfBirth || "",
    joiningDate: staff.joiningDate || "",
    address: staff.address || "",
    salary: staff.salary ?? "",
    status: staff.status === "inactive" ? "inactive" : "active",
    password: "",
  }
}

/** Quota maths: how many slots are free for a role (self excluded on edit). */
function slotsFor(role, stats, editingStaff) {
  const limit = STAFF_QUOTAS[role]
  const current = Number(stats?.[role] ?? 0)
  const selfCounted = editingStaff && editingStaff.role === role ? 1 : 0
  const used = Math.max(0, current - selfCounted)
  return { limit, used, free: Math.max(0, limit - used) }
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

/**
 * Create / edit a staff member. Every mutation hits the admin API, which
 * enforces the school's head-count quotas server-side as well.
 */
export function StaffFormDialog({ open, onOpenChange, staff, stats, onSaved }) {
  const isEdit = Boolean(staff)
  const [form, setForm] = useState(() => toFormValues(staff))
  const [errors, setErrors] = useState({})
  const [pending, setPending] = useState(false)

  useEffect(() => {
    if (open) {
      setForm(toFormValues(staff))
      setErrors({})
      setPending(false)
    }
  }, [open, staff])

  const set = (field) => (event) =>
    setForm((prev) => ({ ...prev, [field]: event.target.value }))

  const toggleSubject = (subject) =>
    setForm((prev) => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter((s) => s !== subject)
        : [...prev.subjects, subject],
    }))

  const quota = slotsFor(form.role, stats, isEdit ? staff : null)
  const quotaFull = quota.free <= 0

  const validate = () => {
    const next = {}
    if (!form.name.trim()) next.name = "Full name is required."
    const email = form.email.trim().toLowerCase()
    if (!email) next.email = "Email is required."
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      next.email = "Enter a valid email address."
    if (form.role === "teacher" && form.subjects.length === 0)
      next.subjects = "Pick at least one subject for a teacher."
    if (form.role === "admin" && !form.department)
      next.department = "Choose the staff member's department."
    if (form.role === "support" && !form.duty)
      next.duty = "Choose the duty for this supporting staff member."
    if (!isEdit && !form.password) next.password = "Set a password for the portal login."
    if (form.password && form.password.length < 6)
      next.password = "Password must be at least 6 characters."
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!validate()) return
    setPending(true)

    const payload = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      role: form.role,
      department: form.department,
      category:
        form.role === "admin"
          ? form.department
          : form.role === "support"
            ? "Support Staff"
            : form.role === "teacher"
              ? "Teaching Staff"
              : "Principal's Office",
      subjects: form.role === "teacher" ? form.subjects : [],
      duty: form.role === "support" ? form.duty : "",
      qualification: form.qualification.trim(),
      gender: form.gender,
      dateOfBirth: form.dateOfBirth,
      joiningDate: form.joiningDate,
      address: form.address.trim(),
      status: form.status,
      ...(form.salary !== "" ? { salary: Number(form.salary) } : {}),
      ...(form.password ? { password: form.password } : {}),
    }

    try {
      if (isEdit) {
        await api.patch(`/api/staff/${staff.id || staff._id}`, payload)
        toast.success(`${payload.name} updated`)
      } else {
        await api.post("/api/staff", payload)
        toast.success(`${payload.name} added to the staff directory`)
      }
      onSaved?.()
      onOpenChange(false)
    } catch (error) {
      toast.error(error.message || "Could not save this staff member")
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-heading">
            {isEdit ? "Edit staff member" : "Add staff member"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this record — the admin dashboard is the source of truth for the whole school."
              : "New records appear immediately across the dashboards and the public staff page."}
          </DialogDescription>
        </DialogHeader>

        {/* quota banner */}
        <div
          className={cn(
            "rounded-xl border p-3 text-sm",
            quotaFull
              ? "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200"
              : "border-border bg-muted/50 text-muted-foreground"
          )}
        >
          <span className="font-semibold text-foreground">
            {quota.used} / {quota.limit}
          </span>{" "}
          {form.role === "support"
            ? "supporting staff"
            : form.role === "admin"
              ? "admin staff"
              : form.role === "teacher"
                ? "teachers"
                : "principal"}{" "}
          positions used — {quotaFull ? "no slots free" : `${quota.free} slot${quota.free === 1 ? "" : "s"} free`}.
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* --------------------------- identity --------------------------- */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" htmlFor="staff-name" error={errors.name}>
              <Input
                id="staff-name"
                value={form.name}
                onChange={set("name")}
                placeholder="e.g. Rumana Islam"
                autoComplete="off"
              />
            </Field>
            <Field
              label="Email (portal login)"
              htmlFor="staff-email"
              error={errors.email}
            >
              <Input
                id="staff-email"
                type="email"
                value={form.email}
                onChange={set("email")}
                placeholder="name@bafwwa.edu.bd"
                autoComplete="off"
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Phone" htmlFor="staff-phone">
              <Input
                id="staff-phone"
                value={form.phone}
                onChange={set("phone")}
                placeholder="+880 1XXX-XXXXXX"
              />
            </Field>
            <Field label="Role" htmlFor="staff-role">
              <NativeSelect
                id="staff-role"
                value={form.role}
                onChange={set("role")}
                className="w-full"
              >
                <NativeSelectOption value="principal">
                  Principal (1)
                </NativeSelectOption>
                <NativeSelectOption value="admin">
                  Admin Staff (8)
                </NativeSelectOption>
                <NativeSelectOption value="teacher">
                  Teacher (65)
                </NativeSelectOption>
                <NativeSelectOption value="support">
                  Supporting Staff (50)
                </NativeSelectOption>
              </NativeSelect>
            </Field>
            <Field label="Status" htmlFor="staff-status">
              <NativeSelect
                id="staff-status"
                value={form.status}
                onChange={set("status")}
                className="w-full"
              >
                <NativeSelectOption value="active">Active</NativeSelectOption>
                <NativeSelectOption value="inactive">Inactive</NativeSelectOption>
              </NativeSelect>
            </Field>
          </div>

          {/* ------------------- role-specific sections -------------------- */}
          {form.role === "admin" && (
            <Field
              label="Department"
              htmlFor="staff-department"
              error={errors.department}
            >
              <NativeSelect
                id="staff-department"
                value={form.department}
                onChange={set("department")}
                className="w-full"
              >
                <NativeSelectOption value="">Select department…</NativeSelectOption>
                {DEPARTMENTS.map((dept) => (
                  <NativeSelectOption key={dept} value={dept}>
                    {dept}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>
          )}

          {form.role === "teacher" && (
            <div className="space-y-1.5">
              <Label>Subjects</Label>
              <div className="flex flex-wrap gap-2">
                {TEACHER_SUBJECTS.map((subject) => {
                  const active = form.subjects.includes(subject)
                  return (
                    <button
                      key={subject}
                      type="button"
                      onClick={() => toggleSubject(subject)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                        active
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-muted-foreground hover:text-foreground"
                      )}
                      aria-pressed={active}
                    >
                      {subject}
                    </button>
                  )
                })}
              </div>
              {errors.subjects ? (
                <p className="text-xs text-destructive">{errors.subjects}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Shown on the public staff page and your class assignments.
                </p>
              )}
            </div>
          )}

          {form.role === "support" && (
            <Field label="Duty" htmlFor="staff-duty" error={errors.duty}>
              <NativeSelect
                id="staff-duty"
                value={form.duty}
                onChange={set("duty")}
                className="w-full"
              >
                <NativeSelectOption value="">Select duty…</NativeSelectOption>
                {DUTY_OPTIONS()}
              </NativeSelect>
            </Field>
          )}

          {/* --------------------------- details --------------------------- */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Qualification" htmlFor="staff-qual">
              <Input
                id="staff-qual"
                value={form.qualification}
                onChange={set("qualification")}
                placeholder="B.Ed, M.A…"
              />
            </Field>
            <Field label="Gender" htmlFor="staff-gender">
              <NativeSelect
                id="staff-gender"
                value={form.gender}
                onChange={set("gender")}
                className="w-full"
              >
                {GENDERS.map((g) => (
                  <NativeSelectOption key={g} value={g}>
                    {g === "F" ? "Female" : "Male"}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>
            <Field label="Salary (BDT)" htmlFor="staff-salary">
              <Input
                id="staff-salary"
                type="number"
                min="0"
                value={form.salary}
                onChange={set("salary")}
                placeholder="30000"
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Date of birth" htmlFor="staff-dob">
              <Input
                id="staff-dob"
                type="date"
                value={form.dateOfBirth}
                onChange={set("dateOfBirth")}
              />
            </Field>
            <Field label="Joining date" htmlFor="staff-join">
              <Input
                id="staff-join"
                type="date"
                value={form.joiningDate}
                onChange={set("joiningDate")}
              />
            </Field>
          </div>

          <Field label="Address" htmlFor="staff-address">
            <Textarea
              id="staff-address"
              rows={2}
              value={form.address}
              onChange={set("address")}
              placeholder="Area, Dhaka"
            />
          </Field>

          <Field
            label={isEdit ? "Reset password (optional)" : "Portal password"}
            htmlFor="staff-password"
            error={errors.password}
            hint={
              isEdit
                ? "Leave empty to keep the current password."
                : "Supporting staff never receive login credentials."
            }
          >
            <Input
              id="staff-password"
              type="text"
              value={form.password}
              onChange={set("password")}
              placeholder="at least 6 characters"
              disabled={form.role === "support"}
            />
          </Field>

          <DialogFooter className="gap-2 border-t border-border pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={pending || (quotaFull && !isEdit)}
            >
              {pending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : isEdit ? (
                <Save className="size-4" />
              ) : (
                <UserPlus className="size-4" />
              )}
              {pending
                ? "Saving…"
                : isEdit
                  ? "Save changes"
                  : "Add staff member"}
            </Button>
          </DialogFooter>

          {quotaFull && !isEdit && (
            <p className="text-center text-xs text-amber-700 dark:text-amber-300">
              Every {form.role} position is filled — remove a record first to
              free a slot.
            </p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
}

function DUTY_OPTIONS() {
  return SUPPORT_DUTIES.map((duty) => (
    <NativeSelectOption key={duty} value={duty}>
      {duty}
    </NativeSelectOption>
  ))
}

export default StaffFormDialog
