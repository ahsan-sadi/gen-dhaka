"use client"

import { useEffect, useState } from "react"
import { CalendarDays, Info, Loader2, Save } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import PageHeader from "@/components/shared/page-header"
import { RoleBadge } from "@/components/shared/role-badge"
import { api } from "@/lib/api"
import { useAuth, useRequireAuth } from "@/lib/auth-context"
import { ROLE_LABELS, formatDate } from "@/lib/constants"
import { avatarUrl } from "@/lib/utils"

export default function ProfilePage() {
  const { user, ready } = useRequireAuth()
  const { refreshUser } = useAuth()

  const [form, setForm] = useState({ name: "", phone: "", image: "" })
  const [syncedFrom, setSyncedFrom] = useState(null)
  const [pending, setPending] = useState(false)

  /* seed the form once per signed-in account */
  useEffect(() => {
    if (!ready || !user || syncedFrom === user.id) return
    setForm({
      name: user.name || "",
      phone: user.phone || "",
      image: user.image || "",
    })
    setSyncedFrom(user.id)
  }, [ready, user, syncedFrom])

  const update = (field) => (event) =>
    setForm((prev) => ({ ...prev, [field]: event.target.value }))

  const handleSubmit = async (event) => {
    event.preventDefault()
    const name = form.name.trim()
    if (!name) {
      toast.error("Please enter your full name")
      return
    }

    setPending(true)
    try {
      await api.patch("/api/auth/profile", {
        name,
        phone: form.phone.trim(),
        image: form.image.trim(),
      })
      await refreshUser()
      toast.success("Profile updated")
    } catch (error) {
      toast.error(error.message || "Could not save your profile")
    } finally {
      setPending(false)
    }
  }

  if (!ready || !user) {
    return (
      <div className="flex min-h-[45vh] items-center justify-center text-sm text-muted-foreground">
        Opening your profile…
      </div>
    )
  }

  const isStudent = user.role === "student"
  const refId = user.employeeId || user.studentId || "—"

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Account"
        title="My profile"
        description="Your school record as held by the admin office. Contact details and photo can be updated here; role, ID and class assignments are managed by the administration."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ------------------------------ form ------------------------------ */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-border bg-card lg:col-span-2"
        >
          <div className="border-b border-border px-5 py-4">
            <h2 className="font-heading text-lg font-extrabold tracking-tight text-foreground">
              Personal details
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Your email is your sign-in identity and stays fixed.
            </p>
          </div>

          <div className="space-y-5 p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="profile-name">Full name</Label>
                <Input
                  id="profile-name"
                  value={form.name}
                  onChange={update("name")}
                  placeholder="e.g. Sadia Rahman"
                  className="h-10"
                  autoComplete="name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-email">Email</Label>
                <Input
                  id="profile-email"
                  type="email"
                  value={user.email || ""}
                  readOnly
                  disabled
                  className="h-10"
                  autoComplete="email"
                />
                <p className="text-xs text-muted-foreground">
                  Your sign-in email — it cannot be changed here.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="profile-phone">Phone</Label>
                <Input
                  id="profile-phone"
                  value={form.phone}
                  onChange={update("phone")}
                  placeholder="+880 1XXX-XXXXXX"
                  className="h-10"
                  autoComplete="tel"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-id">School ID</Label>
                <Input
                  id="profile-id"
                  value={refId}
                  readOnly
                  disabled
                  className="h-10"
                />
                <p className="text-xs text-muted-foreground">
                  Issued by the admin office.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-image-url">Profile picture URL</Label>
              <Input
                id="profile-image-url"
                value={form.image}
                onChange={update("image")}
                placeholder="https://api.dicebear.com/9.x/notionists/svg?seed=you"
                className="h-10"
              />
              <p className="text-xs text-muted-foreground">
                Leave empty to use your automatic initials avatar.
              </p>
            </div>
          </div>

          <div className="flex justify-end border-t border-border px-5 py-4">
            <Button type="submit" disabled={pending}>
              {pending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {pending ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </form>

        {/* ----------------------------- side card ---------------------------- */}
        <aside className="space-y-6">
          <Card className="rounded-2xl border border-border">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center gap-4">
                <img
                  src={avatarUrl(user)}
                  alt={user.name}
                  className="size-20 shrink-0 rounded-full border border-border bg-muted object-cover"
                />
                <div className="min-w-0">
                  <p className="truncate font-heading text-base font-extrabold tracking-tight text-foreground">
                    {user.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </p>
                  <div className="mt-2">
                    <RoleBadge role={user.role} />
                  </div>
                </div>
              </div>

              <Separator />

              <dl className="space-y-2 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">Role</dt>
                  <dd className="font-medium">
                    {ROLE_LABELS[user.role] || user.role}
                  </dd>
                </div>
                {!isStudent && user.department && (
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-muted-foreground">Department</dt>
                    <dd className="font-medium">{user.department}</dd>
                  </div>
                )}
                {!isStudent && user.subjects?.length > 0 && (
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-muted-foreground">Subjects</dt>
                    <dd className="text-right font-medium">
                      {user.subjects.join(", ")}
                    </dd>
                  </div>
                )}
                {isStudent && (
                  <>
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-muted-foreground">Class</dt>
                      <dd className="font-medium">{user.className || "—"}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-muted-foreground">Session</dt>
                      <dd className="font-medium">{user.sessionName || "—"}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-muted-foreground">Roll no</dt>
                      <dd className="font-medium">{user.rollNo ?? "—"}</dd>
                    </div>
                  </>
                )}
              </dl>

              <Separator />

              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarDays className="size-4 shrink-0" />
                Record since{" "}
                <span className="font-medium text-foreground">
                  {formatDate(user.createdAt)}
                </span>
              </p>

              <p className="flex items-start gap-2 rounded-xl border border-border bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
                <Info className="mt-0.5 size-4 shrink-0" />
                Your role, class and session assignments are controlled by the
                Admin dashboard and cannot be changed from here.
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}
