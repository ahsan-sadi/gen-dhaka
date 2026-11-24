"use client"

import { useEffect, useMemo, useState } from "react"
import { Loader2, Save } from "lucide-react"
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
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Switch } from "@/components/ui/switch"
import { api } from "@/lib/api"
import { SESSIONS } from "@/lib/constants"
import { toList } from "@/lib/utils"

const EMPTY = {
  name: "",
  sessionId: "",
  classTeacherId: "",
  capacity: 30,
  sortOrder: "",
  isActive: true,
}

function toFormValues(klass, defaultSessionId) {
  if (!klass) {
    return { ...EMPTY, sessionId: defaultSessionId || "" }
  }
  return {
    name: klass.name || "",
    sessionId: klass.sessionId || "",
    classTeacherId: klass.classTeacherId || "",
    capacity: klass.capacity ?? 30,
    sortOrder: klass.sortOrder ?? "",
    isActive: klass.isActive !== false,
  }
}

function Field({ label, htmlFor, hint, error, children }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : (
        hint && <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  )
}

/**
 * Create or edit a class inside a session, including its class teacher.
 * `sessions` and `teachers` come from the API (already loaded by the page).
 */
export function ClassFormDialog({
  open,
  onOpenChange,
  klass,
  sessions,
  teachers,
  defaultSessionId,
  onSaved,
  onRequestDelete,
}) {
  const isEdit = Boolean(klass)
  const [form, setForm] = useState(() => toFormValues(klass, defaultSessionId))
  const [errors, setErrors] = useState({})
  const [pending, setPending] = useState(false)

  useEffect(() => {
    if (open) {
      setForm(toFormValues(klass, defaultSessionId))
      setErrors({})
      setPending(false)
    }
  }, [open, klass, defaultSessionId])

  const teacherList = useMemo(() => {
    return toList(teachers, "staff")
      .slice()
      .sort((a, b) =>
        String(a.employeeId || "").localeCompare(String(b.employeeId || "")),
      )
  }, [teachers])

  const sessionList = toList(sessions, "sessions")
  const selectedSession =
    sessionList.find((s) => s.id === form.sessionId) || sessionList[0]

  // Preset class names for the chosen session, plus anything already typed.
  const presets = useMemo(() => {
    const match = SESSIONS.find((s) => s.name === selectedSession?.name)
    const list = match ? [...match.classes] : []
    if (form.name && !list.includes(form.name)) list.push(form.name)
    return list
  }, [selectedSession, form.name])

  const set = (field) => (event) =>
    setForm((prev) => ({ ...prev, [field]: event.target.value }))

  const validate = () => {
    const next = {}
    if (!form.name.trim()) next.name = "Class name is required."
    if (!form.sessionId) next.sessionId = "Choose a session for this class."
    if (form.capacity !== "" && !(Number(form.capacity) > 0))
      next.capacity = "Capacity must be a positive number."
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!validate()) return
    setPending(true)

    const payload = {
      name: form.name.trim(),
      sessionId: form.sessionId,
      classTeacherId: form.classTeacherId || null,
      capacity: Number(form.capacity) || 30,
      isActive: form.isActive,
      ...(form.sortOrder !== "" ? { sortOrder: Number(form.sortOrder) } : {}),
    }

    try {
      if (isEdit) {
        await api.patch(`/api/classes/${klass.id || klass._id}`, payload)
        toast.success(`${payload.name} updated`)
      } else {
        await api.post("/api/classes", payload)
        toast.success(`${payload.name} added to ${selectedSession?.name || "the session"}`)
      }
      onSaved?.()
      onOpenChange(false)
    } catch (error) {
      toast.error(error.message || "Could not save this class")
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-heading">
            {isEdit ? "Edit class" : "Add class"}
          </DialogTitle>
          <DialogDescription>
            Classes belong to a session and are taught by a class teacher from
            the 65-teacher roster.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Class name"
              htmlFor="class-name"
              error={errors.name}
              hint="Pick a standard name or type your own."
            >
              <Input
                id="class-name"
                list="class-name-presets"
                value={form.name}
                onChange={set("name")}
                placeholder="e.g. Nursery-II"
                autoComplete="off"
              />
              <datalist id="class-name-presets">
                {presets.map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
            </Field>

            <Field
              label="Session"
              htmlFor="class-session"
              error={errors.sessionId}
            >
              <NativeSelect
                id="class-session"
                value={form.sessionId}
                onChange={set("sessionId")}
                className="w-full"
              >
                <NativeSelectOption value="">Select session…</NativeSelectOption>
                {sessionList.map((session) => (
                  <NativeSelectOption key={session.id} value={session.id}>
                    {session.name} · {session.medium}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>
          </div>

          <Field
            label="Class teacher"
            htmlFor="class-teacher"
            hint="Must be a staff member with the teacher role. Leave unassigned to fill later."
          >
            <NativeSelect
              id="class-teacher"
              value={form.classTeacherId}
              onChange={set("classTeacherId")}
              className="w-full"
            >
              <NativeSelectOption value="">Unassigned</NativeSelectOption>
              {teacherList.map((teacher) => (
                <NativeSelectOption key={teacher.id} value={teacher.id}>
                  {teacher.employeeId} — {teacher.name}
                  {teacher.subjects?.length
                    ? ` (${teacher.subjects.join(", ")})`
                    : ""}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field
              label="Capacity"
              htmlFor="class-capacity"
              error={errors.capacity}
              hint="Seats per class."
            >
              <Input
                id="class-capacity"
                type="number"
                min="1"
                value={form.capacity}
                onChange={set("capacity")}
              />
            </Field>

            <Field
              label="Display order"
              htmlFor="class-order"
              hint="Lower first."
            >
              <Input
                id="class-order"
                type="number"
                min="1"
                value={form.sortOrder}
                onChange={set("sortOrder")}
                placeholder="auto"
              />
            </Field>

            <div className="space-y-1.5">
              <Label htmlFor="class-active">Class active</Label>
              <label
                htmlFor="class-active"
                className="flex h-8 cursor-pointer items-center gap-3 rounded-lg border border-border bg-background px-3"
              >
                <Switch
                  id="class-active"
                  checked={form.isActive}
                  onCheckedChange={(checked) =>
                    setForm((prev) => ({ ...prev, isActive: checked }))
                  }
                />
                <span className="text-sm text-muted-foreground">
                  {form.isActive ? "Running" : "Paused"}
                </span>
              </label>
            </div>
          </div>

          <DialogFooter className="gap-2 border-t border-border pt-4">
            {isEdit && onRequestDelete && (
              <Button
                type="button"
                variant="ghost"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive sm:mr-auto"
                disabled={pending}
                onClick={() => onRequestDelete(klass)}
              >
                Delete class
              </Button>
            )}
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
              ) : (
                <Save className="size-4" />
              )}
              {pending ? "Saving…" : isEdit ? "Save changes" : "Add class"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default ClassFormDialog
