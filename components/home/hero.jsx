import Link from "next/link"
import { ArrowRight, CalendarRange, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { SCHOOL_INFO, SESSIONS, STAFF_HEADCOUNT } from "@/lib/constants"

/* Public landing hero — school identity + the two academic sessions. */
export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_15%_0%,indigo-500/15,transparent),radial-gradient(50%_45%_at_85%_10%,fuchsia-500/15,transparent)]"
      />
      <div className="container-page section relative">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="eyebrow">
              <Sparkles className="size-3.5" /> {SCHOOL_INFO.tagline}
            </p>
            <h1 className="section-title mt-4 sm:text-5xl">
              {SCHOOL_INFO.name}
              <span className="text-gradient"> — where little learners</span>{" "}
              take their first step.
            </h1>
            <p className="section-lead mt-5 max-w-xl">
              Two parallel sessions run under one roof — a Morning Session in
              English Medium (July to June) and an Afternoon Session in English
              Version (January to December) — with Play Group through KG
              classes, managed end-to-end by our administration.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button size="lg" render={<Link href="/sign-in" />}>
                Portal Login <ArrowRight className="size-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                render={<Link href="/#sessions" />}
              >
                <CalendarRange className="size-4" /> Explore Sessions
              </Button>
            </div>

            <dl className="mt-10 grid max-w-lg grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                ["2", "Sessions"],
                ["6", "Classes"],
                [
                  String(
                    STAFF_HEADCOUNT.principal +
                      STAFF_HEADCOUNT.admin +
                      STAFF_HEADCOUNT.teacher +
                      STAFF_HEADCOUNT.support
                  ),
                  "Staff",
                ],
                ["4", "Dashboards"],
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-border bg-card p-4"
                >
                  <dt className="sr-only">{label}</dt>
                  <dd>
                    <span className="block font-heading text-2xl font-extrabold tracking-tight text-foreground">
                      {value}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {label}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* session preview cards */}
          <div className="grid gap-5">
            {SESSIONS.map((session) => (
              <div
                key={session.id}
                className={`rounded-2xl border border-border bg-card p-5 shadow-sm ring-4 ${session.ring}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-heading text-lg font-extrabold tracking-tight">
                      {session.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {session.medium} · {session.period}
                    </p>
                  </div>
                  <span
                    className={`rounded-full bg-gradient-to-br ${session.accent} px-3 py-1 text-xs font-semibold text-white`}
                  >
                    {session.classes.length} classes
                  </span>
                </div>
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
      </div>
    </section>
  )
}

export default Hero
