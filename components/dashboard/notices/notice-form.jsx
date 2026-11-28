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
import {
  NOTICE_AUDIENCES,
  NOTICE_AUDIENCE_LABELS,
  NOTICE_PRIORITIES,
  NOTICE_PRIORITY_LABELS,
} from "@/lib/constants"

const EMPTY = {
  title: "",
  body: "",
  audience: "all",
  priority: "normal",
  sessionId: "",
  classId: "",
  date: "",
}

function toFormValues(notice) {
  if (!notice) {
    return { ...EMPTY, date: new Date().toISOString().slice(0, 10) }
  }
  return {
    title: notice.title || "",
    body: notice.body || "",
    audience: notice.audience || "all",
    priority: notice.priority || "normal",
    sessionId: notice.sessionId || "",
    classId: notice.classId || "",
    date: notice.date || new Date().toISOString().slice(0, 10),
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
 * Notice composer for the Admin dashboard — create or edit a notice.
 *
 * Audience decides who the board shows it to; optionally narrow it to a
 * single session/class (e.g. only Morning Play Group).
 */
export function NoticeFormDialog({ open, onOpenChange, notice, onSaved }) {
  const isEdit = Boolean(notice)
  const [form, setForm] = useState(() => toFormValues(notice))
  const [errors, setErrors] = useState({})
  const [pending, setPending] = useState(false)
  const [sessions, setSessions] = useState([])
  const [classes, setClasses] = useState([])

  const set = (field) => (event) =>
    setForm((prev) => ({ ...prev, [field]: event.target.value }))

  useEffect(() => {
    if (open) {
      setForm(toFormValues(notice))
      setErrors({})
      setPending(false)
    }
  }, [open, notice])

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
  }

  const validate = () => {
    const next = {}
    if (!form.title.trim()) next.title = "Title is required."
    else if (form.title.trim().length > 160)
      next.title = "Keep the title under 160 characters."
    if (!form.body.trim()) next.body = "Notice text is required."
    // Class targeting requires a session.
    if (form.classId && !form.sessionId) next.sessionId = "Choose a session."
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!validate()) return
    setPending(true)

    const payload = {
      title: form.title.trim(),
      body: form.body.trim(),
      audience: form.audience,
      priority: form.priority,
      sessionId: form.sessionId,
      classId: form.classId,
      date: form.date,
    }

    try {
      if (isEdit) {
        await api.patch(`/api/notices/${notice.id || notice._id}`, payload)
        toast.success(`“${payload.title}” updated`)
      } else {
        await api.post("/api/notices", payload)
        toast.success(`“${payload.title}” published`)
      }
      onSaved?.()
      onOpenChange(false)
    } catch (error) {
      toast.error(error.message || "Could not save this notice")
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-heading">
            {isEdit ? "Edit notice" : "Publish a notice"}
          </DialogTitle>
          <DialogDescription>
            The notice appears instantly on the dashboards of everyone it is
            addressed to.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <Field label="Title" htmlFor="notice-title" error={errors.title}>
            <Input
              id="notice-title"
              value={form.title}
              onChange={set("title")}
              placeholder="e.g. Annual Sports Day — 12 December"
              autoComplete="off"
            />
          </Field>

          <Field
            label="Notice"
            htmlFor="notice-body"
            error={errors.body}
            hint="What should the school community know?"
          >
            <Textarea
              id="notice-body"
              rows={5}
              value={form.body}
              onChange={set("body")}
              placeholder="Write the announcement…"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field
              label="Addressed to"
              htmlFor="notice-audience"
              hint="Who sees it on their dashboard."
            >
              <NativeSelect
                id="notice-audience"
                value={form.audience}
                onChange={set("audience")}
                className="w-full"
              >
                {NOTICE_AUDIENCES.map((audience) => (
                  <NativeSelectOption key={audience} value={audience}>
                    {NOTICE_AUDIENCE_LABELS[audience]}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>

            <Field label="Priority" htmlFor="notice-priority">
              <NativeSelect
                id="notice-priority"
                value={form.priority}
                onChange={set("priority")}
                className="w-full"
              >
                {NOTICE_PRIORITIES.map((priority) => (
                  <NativeSelectOption key={priority} value={priority}>
                    {NOTICE_PRIORITY_LABELS[priority]}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>

            <Field label="Publish date" htmlFor="notice-date">
              <Input
                id="notice-date"
                type="date"
                value={form.date}
                onChange={set("date")}
              />
            </Field>
          </div>

          {/* --------------------- optional class targeting ---------------- */}
          <div className="rounded-xl border border-border bg-background p-4">
            <p className="text-sm font-semibold">Narrow to one class</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Optional — leave both on “All” to reach the whole audience.
            </p>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <Field label="Session" htmlFor="notice-session">
                <NativeSelect
                  id="notice-session"
                  value={form.sessionId}
                  onChange={handleSessionChange}
                  className="w-full"
                >
                  <NativeSelectOption value="">All sessions</NativeSelectOption>
                  {sessions.map((session) => (
                    <NativeSelectOption key={session.id} value={session.id}>
                      {session.name}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </Field>
              <Field
                label="Class"
                htmlFor="notice-class"
                hint={
                  form.sessionId
                    ? "Classes of the selected session."
                    : "Pick a session first."
                }
              >
                <NativeSelect
                  id="notice-class"
                  value={form.classId}
                  onChange={set("classId")}
                  className="w-full"
                  disabled={!form.sessionId}
                >
                  <NativeSelectOption value="">All classes</NativeSelectOption>
                  {classes.map((klass) => (
                    <NativeSelectOption key={klass.id} value={klass.id}>
                      {klass.name}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </Field>
            </div>
          </div>

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
              {isEdit ? "Save changes" : "Publish notice"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default NoticeFormDialog
