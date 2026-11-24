"use client"

import { useEffect, useState } from "react"
import { Loader2, Power, Save } from "lucide-react"
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

const NAMES = ["Morning Session", "Afternoon Session"]
const MEDIUMS = ["English Medium", "English Version"]
const PERIODS = ["July to June", "January to December"]

/* The school's canonical pairing: Morning → English Medium → Jul–Jun,
   Afternoon → English Version → Jan–Dec. Picking the name fills the rest. */
const CANONICAL = {
  "Morning Session": { medium: "English Medium", period: "July to June" },
  "Afternoon Session": {
    medium: "English Version",
    period: "January to December",
  },
}

function toFormValues(session) {
  if (!session) {
    return {
      name: "Morning Session",
      medium: "English Medium",
      period: "July to June",
      sortOrder: 1,
      isActive: true,
    }
  }
  return {
    name: session.name || "Morning Session",
    medium: session.medium || "English Medium",
    period: session.period || "July to June",
    sortOrder: session.sortOrder ?? 1,
    isActive: session.isActive !== false,
  }
}

function Field({ label, htmlFor, hint, children }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

/** Edit one of the school's two academic sessions. */
export function SessionFormDialog({
  open,
  onOpenChange,
  session,
  onSaved,
  onRequestDelete,
}) {
  const [form, setForm] = useState(() => toFormValues(session))
  const [pending, setPending] = useState(false)

  useEffect(() => {
    if (open) {
      setForm(toFormValues(session))
      setPending(false)
    }
  }, [open, session])

  const setName = (event) => {
    const name = event.target.value
    const canonical = CANONICAL[name]
    setForm((prev) => ({
      ...prev,
      name,
      ...(canonical ? canonical : {}),
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setPending(true)
    try {
      await api.patch(`/api/sessions/${session.id || session._id}`, {
        name: form.name,
        medium: form.medium,
        period: form.period,
        sortOrder: Number(form.sortOrder),
        isActive: form.isActive,
      })
      toast.success(`${form.name} updated`)
      onSaved?.()
      onOpenChange(false)
    } catch (error) {
      toast.error(error.message || "Could not update this session")
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading">Edit session</DialogTitle>
          <DialogDescription>
            Both sessions of BAFWWA GEN DHAKA are fixed by the school calendar —
            you can adjust their activation and display order here.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <Field label="Session name" htmlFor="session-name">
            <NativeSelect
              id="session-name"
              value={form.name}
              onChange={setName}
              className="w-full"
            >
              {NAMES.map((name) => (
                <NativeSelectOption key={name} value={name}>
                  {name}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Medium"
              htmlFor="session-medium"
              hint="How subjects are taught."
            >
              <NativeSelect
                id="session-medium"
                value={form.medium}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, medium: event.target.value }))
                }
                className="w-full"
              >
                {MEDIUMS.map((medium) => (
                  <NativeSelectOption key={medium} value={medium}>
                    {medium}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>

            <Field
              label="Academic year"
              htmlFor="session-period"
              hint="Sets start/end months automatically."
            >
              <NativeSelect
                id="session-period"
                value={form.period}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, period: event.target.value }))
                }
                className="w-full"
              >
                {PERIODS.map((period) => (
                  <NativeSelectOption key={period} value={period}>
                    {period}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Display order"
              htmlFor="session-order"
              hint="Lower numbers appear first."
            >
              <Input
                id="session-order"
                type="number"
                min="1"
                value={form.sortOrder}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    sortOrder: event.target.value,
                  }))
                }
              />
            </Field>

            <div className="space-y-1.5">
              <Label htmlFor="session-active">Session active</Label>
              <label
                htmlFor="session-active"
                className="flex h-8 cursor-pointer items-center gap-3 rounded-lg border border-border bg-background px-3"
              >
                <Switch
                  id="session-active"
                  checked={form.isActive}
                  onCheckedChange={(checked) =>
                    setForm((prev) => ({ ...prev, isActive: checked }))
                  }
                />
                <span className="text-sm text-muted-foreground">
                  {form.isActive ? "Running now" : "Paused"}
                </span>
              </label>
            </div>
          </div>

          {/* what the calendar looks like */}
          <div className="rounded-xl border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
            Runs from{" "}
            <span className="font-medium text-foreground">
              {form.period === "July to June" ? "July" : "January"}
            </span>{" "}
            to{" "}
            <span className="font-medium text-foreground">
              {form.period === "July to June" ? "June" : "December"}
            </span>{" "}
            · taught in{" "}
            <span className="font-medium text-foreground">{form.medium}</span>
          </div>

          <DialogFooter className="gap-2 border-t border-border pt-4">
            {onRequestDelete && (
              <Button
                type="button"
                variant="ghost"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive sm:mr-auto"
                disabled={pending}
                onClick={() => onRequestDelete(session)}
              >
                Delete session
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
              {pending ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/** Inline activate/pause control used on the session cards. */
export function SessionActiveSwitch({ session, onSaved }) {
  const [pending, setPending] = useState(false)
  const next = session.isActive === false

  const toggle = async () => {
    setPending(true)
    try {
      await api.patch(`/api/sessions/${session.id || session._id}`, {
        isActive: next,
      })
      toast.success(
        `${session.name} ${next ? "activated" : "paused"}`,
      )
      onSaved?.()
    } catch (error) {
      toast.error(error.message || "Could not update this session")
    } finally {
      setPending(false)
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-pressed={next}
      className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-60"
    >
      <Power className="size-3.5" />
      {pending ? "Saving…" : next ? "Activate" : "Pause"}
    </button>
  )
}

/** Quick reference of the classes a session holds (from the constants). */
export function sessionMeta(name) {
  return SESSIONS.find((session) => session.name === name) || null
}

export default SessionFormDialog
