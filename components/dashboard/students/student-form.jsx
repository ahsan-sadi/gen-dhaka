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
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { api } from "@/lib/api"
import { cn, toList } from "@/lib/utils"

const EMPTY = {
  name: "",
  email: "",
  phone: "",
  gender: "F",
  dateOfBirth: "",
  address: "",
  guardianName: "",
  guardianPhone: "",
  sessionId: "",
  classId: "",
  admissionDate: new Date().toISOString().slice(0, 10),
  status: "active",
  rollNo: "",
  password: "",
}

function toFormValues(student) {
  if (!student) return { ...EMPTY }
  return {
    name: student.name || "",
    email: student.email || "",
    phone: student.phone || "",
    gender: student.gender === "M" ? "M" : "F",
    dateOfBirth: student.dateOfBirth || "",
    address: student.address || "",
    guardianName: student.guardianName || "",
    guardianPhone: student.guardianPhone || "",
    sessionId: student.sessionId || "",
    classId: student.classId || "",
    admissionDate:
      student.admissionDate || new Date().toISOString().slice(0, 10),
    status: student.status === "inactive" ? "inactive" : "active",
    rollNo: student.rollNo ?? "",
    password: "",
  }
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
 * Admissions form: create or edit a student.
 *
 * - POST /api/students auto-assigns studentId (BAF-2026-xxx) and the next
 *   free roll number inside the class; password defaults to 123456.
 * - PATCH accepts full admin edits, including a class transfer — when the
 *   class changes and the roll number was not edited by hand, the backend
 *   assigns the next free roll number in the new class automatically.
 */
export function StudentFormDialog({ open, onOpenChange, student, onSaved }) {
  const isEdit = Boolean(student)
  const [form, setForm] = useState(() => toFormValues(student))
  const [errors, setErrors] = useState({})
  const [pending, setPending] = useState(false)
  const [sessions, setSessions] = useState([])
  const [classes, setClasses] = useState([])
  // Only send rollNo to PATCH when the admin actually typed one — otherwise
  // the backend can auto-assign the next roll number for a new class.
  const [rollTouched, setRollTouched] = useState(false)

  const set = (field) => (event) =>
    setForm((prev) => ({ ...prev, [field]: event.target.value }))

  useEffect(() => {
    if (open) {
      setForm(toFormValues(student))
      setErrors({})
      setPending(false)
      setRollTouched(false)
    }
  }, [open, student])

  // Sessions are loaded once per dialog open.
  useEffect(() => {
    if (!open || sessions.length) return
    let cancelled = false
    ;(async () => {
      try {
        const res = await api.get("/api/sessions")
        if (!cancelled) setSessions(toList(res, "sessions"))
      } catch {
        /* surfaced by the page-level alert */
      }
    })()
    return () => {
      cancelled = true
    }
  }, [open, sessions.length])

  // Classes follow the selected session (cascading select).
  useEffect(() => {
    if (!open) return
    let cancelled = false
    ;(async () => {
      if (!form.sessionId) {
        if (!cancelled) setClasses([])
        return
      }
      try {
        const res = await api.get(
          `/api/classes?sessionId=${encodeURIComponent(form.sessionId)}`,
        )
        if (!cancelled) setClasses(toList(res, "classes"))
      } catch {
        /* surfaced by the page-level alert */
      }
    })()
    return () => {
      cancelled = true
    }
  }, [open, form.sessionId])

  const handleSessionChange = (event) => {
    const sessionId = event.target.value
    setForm((prev) => ({ ...prev, sessionId, classId: "" }))
    setErrors((prev) => ({ ...prev, sessionId: undefined, classId: undefined }))
  }

  const validate = () => {
    const next = {}
    if (!form.name.trim()) next.name = "Full name is required."
    const email = form.email.trim().toLowerCase()
    if (!email) next.email = "Email is required."
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      next.email = "Enter a valid email address."
    if (!form.sessionId) next.sessionId = "Choose a session."
    if (!form.classId) next.classId = "Choose a class."
    const guardianDigits = String(form.guardianPhone || "").replace(/\D/g, "")
    if (form.guardianPhone && guardianDigits.length < 10)
      next.guardianPhone = "Enter at least 10 digits."
    if (!isEdit && form.password && form.password.length < 6)
      next.password = "Password must be at least 6 characters."
    if (
      rollTouched &&
      (!Number.isFinite(Number(form.rollNo)) || Number(form.rollNo) < 1)
    ) {
      next.rollNo = "Roll number must be a positive number."
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!validate()) return
    setPending(true)

    const base = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: String(form.phone || "").trim(),
      gender: form.gender,
      dateOfBirth: form.dateOfBirth || null,
      address: String(form.address || "").trim(),
      guardianName: String(form.guardianName || "").trim(),
      guardianPhone: String(form.guardianPhone || "").trim(),
      sessionId: form.sessionId,
      classId: form.classId,
      admissionDate: form.admissionDate,
      status: form.status,
    }

    const payload = isEdit
      ? {
          ...base,
          image: student.image || "",
          // Only when the admin typed a roll number by hand.
          ...(rollTouched ? { rollNo: Number(form.rollNo) } : {}),
        }
      : {
          ...base,
          image: "",
          // New students always start with the school default password.
          password: form.password || "123456",
        }

    try {
      if (isEdit) {
        await api.patch(`/api/students/${student.id || student._id}`, payload)
        toast.success(`${form.name} updated`)
      } else {
        await api.post("/api/students", payload)
        toast.success(`${form.name} enrolled — portal login created`)
      }
      onSaved?.()
      onOpenChange(false)
    } catch (error) {
      toast.error(error.message || "Could not save this student")
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-heading">
            {isEdit ? "Edit student record" : "Enroll new student"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the student's details, transfer them to another class, or pause their portal access."
              : "The student gets a portal login (password 123456 by default). Student ID and roll number are assigned automatically."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* --------------------------- identity --------------------------- */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" htmlFor="student-name" error={errors.name}>
              <Input
                id="student-name"
                value={form.name}
                onChange={set("name")}
                placeholder="e.g. Rumana Islam"
                autoComplete="off"
              />
            </Field>
            <Field
              label="Email (portal login)"
              htmlFor="student-email"
              error={errors.email}
            >
              <Input
                id="student-email"
                type="email"
                value={form.email}
                onChange={set("email")}
                placeholder="name@bafwwa.edu.bd"
                autoComplete="off"
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Phone" htmlFor="student-phone">
              <Input
                id="student-phone"
                type="text"
                value={form.phone}
                onChange={set("phone")}
                placeholder="+880 17XXXXXXXX"
              />
            </Field>
            <Field label="Gender" htmlFor="student-gender">
              <NativeSelect
                id="student-gender"
                value={form.gender}
                onChange={set("gender")}
                className="w-full"
              >
                <NativeSelectOption value="F">Female</NativeSelectOption>
                <NativeSelectOption value="M">Male</NativeSelectOption>
              </NativeSelect>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Date of birth" htmlFor="student-dob">
              <Input
                id="student-dob"
                type="date"
                value={form.dateOfBirth}
                onChange={set("dateOfBirth")}
              />
            </Field>
            <Field label="Admission date" htmlFor="student-admission">
              <Input
                id="student-admission"
                type="date"
                value={form.admissionDate}
                onChange={set("admissionDate")}
              />
            </Field>
          </div>

          <Field label="Address" htmlFor="student-address">
            <Textarea
              id="student-address"
              rows={2}
              value={form.address}
              onChange={set("address")}
              placeholder="Area, Dhaka"
            />
          </Field>

          {/* ---------------------------- guardian --------------------------- */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Guardian name"
              htmlFor="student-guardian"
              hint="Parent or guardian the school contacts."
            >
              <Input
                id="student-guardian"
                value={form.guardianName}
                onChange={set("guardianName")}
                placeholder="Mr. / Ms. Name"
                autoComplete="off"
              />
            </Field>
            <Field
              label="Guardian phone"
              htmlFor="student-gphone"
              error={errors.guardianPhone}
            >
              <Input
                id="student-gphone"
                type="text"
                value={form.guardianPhone}
                onChange={set("guardianPhone")}
                placeholder="17XXXXXXXX"
                inputMode="numeric"
              />
            </Field>
          </div>

          {/* ----------------------- session & class ------------------------ */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Session"
              htmlFor="student-session"
              error={errors.sessionId}
              hint="Morning = English Medium, Afternoon = English Version."
            >
              <NativeSelect
                id="student-session"
                value={form.sessionId}
                onChange={handleSessionChange}
                className="w-full"
              >
                <NativeSelectOption value="">Select session…</NativeSelectOption>
                {sessions.map((session) => (
                  <NativeSelectOption key={session.id} value={session.id}>
                    {session.name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>

            <Field
              label="Class"
              htmlFor="student-class"
              error={errors.classId}
              hint={
                form.sessionId
                  ? "Classes of the selected session."
                  : "Pick a session first."
              }
            >
              <NativeSelect
                id="student-class"
                value={form.classId}
                onChange={set("classId")}
                className="w-full"
                disabled={!form.sessionId}
              >
                <NativeSelectOption value="">Select class…</NativeSelectOption>
                {classes.map((klass) => (
                  <NativeSelectOption key={klass.id} value={klass.id}>
                    {klass.name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>
          </div>

          {/* --------------------------- placement -------------------------- */}
          {isEdit ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Roll number"
                htmlFor="student-roll"
                error={errors.rollNo}
                hint="Leave unchanged to keep the current roll — transfer to a new class auto-assigns the next free one."
              >
                <Input
                  id="student-roll"
                  type="number"
                  min="1"
                  value={form.rollNo}
                  onChange={(event) => {
                    setRollTouched(true)
                    setForm((prev) => ({
                      ...prev,
                      rollNo: event.target.value,
                    }))
                  }}
                />
              </Field>
              <Field label="Status" htmlFor="student-status">
                <NativeSelect
                  id="student-status"
                  value={form.status}
                  onChange={set("status")}
                  className="w-full"
                >
                  <NativeSelectOption value="active">
                    Active — portal access
                  </NativeSelectOption>
                  <NativeSelectOption value="inactive">
                    Inactive — login blocked
                  </NativeSelectOption>
                </NativeSelect>
              </Field>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
              Student ID (<span className="font-mono">BAF-2026-xxx</span>) and
              the roll number inside the class are generated automatically when
              you enroll.
            </div>
          )}

          {/* ------------------------ portal password ------------------------ */}
          {!isEdit && (
            <Field
              label="Portal password"
              htmlFor="student-password"
              error={errors.password}
              hint="Defaults to the school password 123456 — leave empty to use it."
            >
              <Input
                id="student-password"
                type="text"
                value={form.password}
                onChange={set("password")}
                placeholder="123456"
                autoComplete="off"
              />
            </Field>
          )}
          <DialogFooter className="gap-2 border-t border-border pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : isEdit ? (
                "Save changes"
              ) : (
                "Enroll student"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default StudentFormDialog
