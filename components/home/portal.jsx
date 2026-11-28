"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  ArrowRight,
  GraduationCap,
  LayoutDashboard,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/lib/api"
import { STAFF_HEADCOUNT } from "@/lib/constants"
import { cn } from "@/lib/utils"

const FALLBACK = {
  staff: {
    principal: STAFF_HEADCOUNT.principal,
    admin: STAFF_HEADCOUNT.admin,
    teacher: STAFF_HEADCOUNT.teacher,
    support: STAFF_HEADCOUNT.support,
    total:
      STAFF_HEADCOUNT.principal +
      STAFF_HEADCOUNT.admin +
      STAFF_HEADCOUNT.teacher +
      STAFF_HEADCOUNT.support,
  },
  students: { total: null },
}

const PERSONAS = [
  {
    role: "principal",
    title: "Principal",
    icon: ShieldCheck,
    text: "Whole-school overview, reports, approvals and notices — everything at a glance.",
    tone: "text-violet-600 bg-violet-500/10",
  },
  {
    role: "admin",
    title: "Admin Staff",
    icon: Users,
    text: "The control center: staff records, sessions, classes, admissions and day-to-day operations.",
    tone: "text-sky-600 bg-sky-500/10",
  },
  {
    role: "teacher",
    title: "Teachers",
    icon: GraduationCap,
    text: "Assigned classes, student lists and attendance entry for every working day.",
    tone: "text-indigo-600 bg-indigo-500/10",
  },
  {
    role: "student",
    title: "Students",
    icon: UserRound,
    text: "Personal profile, class & session details, attendance history and school notices.",
    tone: "text-emerald-600 bg-emerald-500/10",
  },
]

/* Live head-counts from the backend; falls back to the school's fixed
   structure when the API is unreachable. */
export function SchoolStats() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    api
      .get("/api/stats/overview")
      .then((data) => {
        if (!cancelled) setStats(data)
      })
      .catch(() => {
        /* offline — keep the static fallback */
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const data = stats || FALLBACK

  const items = [
    { label: "Principal", value: data.staff?.principal ?? 1 },
    { label: "Admin Staff", value: data.staff?.admin ?? 8 },
    { label: "Teachers", value: data.staff?.teacher ?? 65 },
    { label: "Supporting Staff", value: data.staff?.support ?? 50 },
    {
      label: "Students Enrolled",
      value: data.students?.total,
      dynamic: true,
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-2xl border border-border bg-card p-5 text-center"
        >
          <div className="font-heading text-3xl font-extrabold tracking-tight text-foreground">
            {loading && item.dynamic ? (
              <Skeleton className="mx-auto h-8 w-14" />
            ) : item.value === null || item.value === undefined ? (
              "—"
            ) : (
              item.value
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{item.label}</p>
        </div>
      ))}
    </div>
  )
}

/* Four dashboards preview — every portal runs off the same admin-managed data. */
export function Portal() {
  return (
    <section className="section">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">School Portals</p>
          <h2 className="section-title mt-3">
            Four dashboards, <span className="text-gradient">one source of truth</span>
          </h2>
          <p className="section-lead mt-4">
            The Admin dashboard creates and controls everything — staff,
            sessions, classes and students. The Principal, Teacher and Student
            dashboards only ever read that verified data.
          </p>
        </div>

        <div className="mt-10">
          <SchoolStats />
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PERSONAS.map(({ role, title, icon: Icon, text, tone }) => (
            <div
              key={role}
              className="card-hover flex h-full flex-col rounded-2xl border border-border bg-card p-5"
            >
              <span
                className={cn(
                  "flex size-11 items-center justify-center rounded-xl",
                  tone
                )}
              >
                <Icon className="size-5" />
              </span>
              <h3 className="mt-4 font-heading text-lg font-bold tracking-tight">
                {title} Dashboard
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                {text}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 w-full"
                render={<Link href="/sign-in" />}
              >
                <LayoutDashboard className="size-4" /> Sign in{" "}
                <ArrowRight className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Portal
