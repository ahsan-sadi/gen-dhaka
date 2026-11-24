import Link from "next/link"
import {
  ArrowRight,
  CalendarRange,
  GraduationCap,
  LayoutDashboard,
  ShieldCheck,
  Users,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  SCHOOL_INFO,
  SESSIONS,
  STAFF_HEADCOUNT,
  ROLE_LABELS,
} from "@/lib/constants"

export const metadata = {
  title: "About the School",
  description:
    "BAFWWA GEN DHAKA — an English Medium and English Version play school with a Morning Session (July–June) and an Afternoon Session (January–December), run from one admin-managed platform.",
}

const structure = [
  {
    icon: ShieldCheck,
    title: ROLE_LABELS.principal,
    count: STAFF_HEADCOUNT.principal,
    text: "Provides overall leadership, reviews reports and approves school-wide decisions from the Principal dashboard.",
  },
  {
    icon: Users,
    title: ROLE_LABELS.admin,
    count: STAFF_HEADCOUNT.admin,
    text: "The control center — manages staff records, sessions, classes, admissions, attendance oversight and notices.",
  },
  {
    icon: GraduationCap,
    title: ROLE_LABELS.teacher,
    count: STAFF_HEADCOUNT.teacher,
    text: "Teach across both sessions, keep class rosters and record daily attendance for their assigned classes.",
  },
  {
    icon: LayoutDashboard,
    title: ROLE_LABELS.support,
    count: STAFF_HEADCOUNT.support,
    text: "Guard, nursing, kitchen, transport, cleaning and grounds staff — records and duties maintained by the admin office (no login required).",
  },
]

const flow = [
  {
    title: "Administration sets up the school",
    text: "The Admin dashboard creates staff records, defines the two sessions and their six classes, and issues login credentials — nothing exists in the system until the admin creates it.",
  },
  {
    title: "Admissions enroll students",
    text: "Every student is admitted into a session and class by the admin, receiving a student ID, roll number and portal login tied to that class.",
  },
  {
    title: "Teachers run the classroom",
    text: "Assigned teachers open their classes, see the student roster and record attendance, which flows straight into reports.",
  },
  {
    title: "Principal reviews the whole picture",
    text: "Live head-counts, class-wise enrollment, attendance summaries and notices are visible in one place for decision-making.",
  },
]

export default function AboutPage() {
  return (
    <>
      {/* ---------------------------- page header --------------------------- */}
      <section className="section border-b border-border/60">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">About the school</p>
            <h1 className="section-title mt-3">
              {SCHOOL_INFO.name} —{" "}
              <span className="text-gradient">{SCHOOL_INFO.motto}</span>
            </h1>
            <p className="section-lead mx-auto">
              {SCHOOL_INFO.tagline} with two parallel academic sessions and six
              classes, run day-to-day through a single admin-controlled
              management platform.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Button size="lg" render={<Link href="/sign-in" />}>
                Portal Login <ArrowRight className="size-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                render={<Link href="/#sessions" />}
              >
                <CalendarRange className="size-4" /> Sessions
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------ structure --------------------------- */}
      <section className="section border-b border-border bg-muted/40">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">School structure</p>
            <h2 className="section-title mt-3">
              {STAFF_HEADCOUNT.principal +
                STAFF_HEADCOUNT.admin +
                STAFF_HEADCOUNT.teacher +
                STAFF_HEADCOUNT.support}{" "}
              people, <span className="text-gradient">one admin office</span>
            </h2>
            <p className="section-lead mx-auto">
              Head-counts are part of the school's identity and are enforced by
              the system — the admin dashboard cannot exceed them.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {structure.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.title}
                  className="card-hover flex h-full flex-col rounded-2xl border border-border bg-card p-6"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/25">
                      <Icon className="size-5" />
                    </span>
                    <span className="font-heading text-3xl font-extrabold tracking-tight text-gradient">
                      {item.count}
                    </span>
                  </div>
                  <h3 className="mt-4 font-heading text-base font-semibold">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.text}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* -------------------------------- flow ------------------------------ */}
      <section className="section border-b border-border">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">How the school runs</p>
            <h2 className="section-title mt-3">
              Admin-first, <span className="text-gradient">step by step</span>
            </h2>
            <p className="section-lead mx-auto">
              Every module is created and controlled from the Admin dashboard;
              the other three dashboards only read verified data.
            </p>
          </div>

          <ol className="relative mx-auto mt-12 max-w-3xl space-y-6">
            {flow.map((step, index) => (
              <li key={step.title} className="relative flex gap-5">
                <div className="flex flex-col items-center">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 font-heading text-sm font-extrabold text-white shadow-lg shadow-indigo-500/25">
                    {index + 1}
                  </span>
                  {index < flow.length - 1 && (
                    <span
                      className="my-2 w-px flex-1 bg-gradient-to-b from-indigo-300 via-violet-300 to-fuchsia-300 dark:from-indigo-800 dark:via-violet-800 dark:to-fuchsia-800"
                      aria-hidden
                    />
                  )}
                </div>
                <div className="card-hover min-w-0 flex-1 rounded-2xl border border-border bg-card p-6">
                  <h3 className="font-heading text-lg font-bold tracking-tight">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {step.text}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ------------------------------- sessions --------------------------- */}
      <section className="section border-b border-border bg-muted/40">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">Sessions at a glance</p>
            <h2 className="section-title mt-3">Morning &amp; Afternoon</h2>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {SESSIONS.map((session) => (
              <div
                key={session.id}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-heading text-lg font-bold tracking-tight">
                    {session.name}
                  </h3>
                  <span
                    className={`rounded-full bg-gradient-to-br ${session.accent} px-3 py-1 text-xs font-semibold text-white`}
                  >
                    {session.medium}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Academic year: {session.period}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {session.classes.map((name) => (
                    <span
                      key={name}
                      className="rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-medium"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------- CTA ------------------------------- */}
      <section className="section">
        <div className="container-page">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 px-8 py-14 text-center shadow-2xl shadow-violet-500/25 sm:px-14">
            <div className="relative mx-auto max-w-2xl">
              <h2 className="font-heading text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Part of {SCHOOL_INFO.name}?
              </h2>
              <p className="mt-4 text-base leading-relaxed text-white/85">
                Principal, admin staff, teachers and students each sign in to
                their own dashboard — credentials are issued by the school
                office.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button
                  size="lg"
                  className="bg-white text-indigo-700 hover:bg-white/90"
                  render={<Link href="/sign-in" />}
                >
                  Sign in <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
