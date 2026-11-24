"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LogIn,
  ShieldCheck,
  UserRound,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Logo } from "@/components/site/logo"
import { dashboardHome, useAuth } from "@/lib/auth-context"
import { DEMO_ACCOUNTS, ROLE_LABELS, SCHOOL_INFO } from "@/lib/constants"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function SignInPage() {
  const router = useRouter()
  const { signIn, isAuthenticated, role, hydrated } = useAuth()

  const [form, setForm] = useState({ email: "", password: "" })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [pending, setPending] = useState(false)
  const [authError, setAuthError] = useState("")

  /* Already signed in? Go straight to the right dashboard. */
  useEffect(() => {
    if (hydrated && isAuthenticated && role) {
      router.replace(dashboardHome(role))
    }
  }, [hydrated, isAuthenticated, role, router])

  const setField = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const validate = () => {
    const next = {}
    if (!form.email.trim()) next.email = "Email is required."
    else if (!EMAIL_RE.test(form.email.trim()))
      next.email = "Enter a valid email address."
    if (!form.password) next.password = "Password is required."
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setAuthError("")
    if (!validate()) return
    setPending(true)

    const result = await signIn({
      email: form.email.trim().toLowerCase(),
      password: form.password,
    })

    setPending(false)
    if (!result.ok) {
      setAuthError(result.error || "Invalid email or password")
      return
    }

    toast.success(`Welcome, ${result.user.name}`)
    router.push(dashboardHome(result.user.role))
    router.refresh()
  }

  const useDemo = (account) => {
    setForm({ email: account.email, password: account.password })
    setErrors({})
    setAuthError("")
    toast.info(`Filled in ${ROLE_LABELS[account.role]} account`)
  }

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="mx-auto grid w-full max-w-5xl items-start gap-10 lg:grid-cols-[1.05fr_1fr]">
        {/* ------------------------------- intro ------------------------------- */}
        <div className="hidden lg:block">
          <Logo />
          <p className="eyebrow mt-8">Staff &amp; Student Portal</p>
          <h1 className="section-title mt-3">
            Welcome back to{" "}
            <span className="text-gradient">{SCHOOL_INFO.name}</span>
          </h1>
          <p className="section-lead mt-4 max-w-md">
            One portal for the Principal, Admin staff, Teachers and Students —
            every session, class and record is managed centrally by the school
            administration.
          </p>

          <ul className="mt-8 space-y-3">
            {[
              ["principal", "Whole-school oversight, reports and approvals"],
              ["admin", "Control center: staff, sessions, classes, students"],
              ["teacher", "Class routines, attendance and student lists"],
              ["student", "Personal profile, attendance and notices"],
            ].map(([roleKey, text]) => (
              <li
                key={roleKey}
                className="flex items-start gap-3 rounded-2xl border border-border bg-card p-3.5"
              >
                <span className="mt-0.5 rounded-lg bg-primary/10 p-1.5 text-primary">
                  <ShieldCheck className="size-4" />
                </span>
                <span>
                  <span className="block text-sm font-semibold">
                    {ROLE_LABELS[roleKey]} Dashboard
                  </span>
                  <span className="block text-sm text-muted-foreground">
                    {text}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* -------------------------------- card -------------------------------- */}
        <div className="mx-auto w-full max-w-md">
          <Card className="rounded-2xl border border-border">
            <CardHeader>
              <CardTitle className="font-heading">Sign in</CardTitle>
              <CardDescription>
                Use the credentials issued by the school admin office.
              </CardDescription>
            </CardHeader>

            <CardContent>
              {authError && (
                <div
                  className="mb-4 rounded-xl border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
                  role="alert"
                >
                  {authError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div className="space-y-1.5">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@bafwwa.edu.bd"
                    value={form.email}
                    onChange={setField("email")}
                    aria-invalid={Boolean(errors.email)}
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="signin-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="signin-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="••••••"
                      className="pr-10"
                      value={form.password}
                      onChange={setField("password")}
                      aria-invalid={Boolean(errors.password)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="absolute top-1/2 right-1.5 -translate-y-1/2"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </Button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-destructive">
                      {errors.password}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={pending}
                >
                  {pending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> Signing
                      in…
                    </>
                  ) : (
                    <>
                      <LogIn className="size-4" /> Sign in
                    </>
                  )}
                </Button>
              </form>

              <p className="mt-4 text-center text-xs text-muted-foreground">
                Accounts are created by the Admin dashboard — contact the
                school office if you need access.
              </p>
            </CardContent>
          </Card>

          {/* --------------------------- demo accounts --------------------------- */}
          <div className="mt-6 rounded-2xl border border-border bg-card p-4 sm:p-5">
            <p className="flex items-center gap-2 font-heading text-sm font-semibold">
              <KeyRound className="size-4 text-primary" /> Demo accounts
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              One click fills the form — every demo password is{" "}
              <span className="font-semibold text-foreground">123456</span>.
            </p>
            <ul className="mt-3 space-y-2">
              {DEMO_ACCOUNTS.map((account) => (
                <li
                  key={account.email}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background p-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {account.email}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {ROLE_LABELS[account.role]} · {account.password}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => useDemo(account)}
                  >
                    <UserRound className="size-3.5" /> Use
                  </Button>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 flex items-center justify-center gap-3 text-sm text-muted-foreground">
            <Separator className="hidden flex-1 sm:block" />
            <Link
              href="/"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              ← Back to {SCHOOL_INFO.name}
            </Link>
            <Separator className="hidden flex-1 sm:block" />
          </div>
        </div>
      </div>
    </div>
  )
}
