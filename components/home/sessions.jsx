import { CalendarDays, Clock, Languages, Users } from "lucide-react"

import { SCHOOL_INFO, SESSIONS } from "@/lib/constants"

/* Deep-dive section for the two academic sessions (anchor: #sessions). */
export function Sessions() {
  return (
    <section id="sessions" className="section scroll-mt-20 border-b border-border">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Academic Sessions</p>
          <h2 className="section-title mt-3">
            Two sessions, <span className="text-gradient">one campus</span>
          </h2>
          <p className="section-lead mt-4">
            Each session follows its own academic calendar and medium of
            instruction. The Admin dashboard is the single place where these
            sessions, their classes and every enrollment are maintained.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {SESSIONS.map((session) => (
            <article
              key={session.id}
              className="card-hover flex h-full flex-col rounded-2xl border border-border bg-card p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-heading text-xl font-extrabold tracking-tight">
                    {session.name}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {session.medium}
                  </p>
                </div>
                <span
                  className={`rounded-full bg-gradient-to-br ${session.accent} px-3 py-1.5 text-xs font-semibold text-white`}
                >
                  Session {session.sortOrder}
                </span>
              </div>

              <dl className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-2.5 rounded-xl border border-border bg-background p-3">
                  <CalendarDays className="size-4 text-primary" />
                  <div>
                    <dt className="text-[11px] text-muted-foreground">
                      Academic year
                    </dt>
                    <dd className="text-sm font-semibold">
                      {session.period}
                    </dd>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 rounded-xl border border-border bg-background p-3">
                  <Languages className="size-4 text-primary" />
                  <div>
                    <dt className="text-[11px] text-muted-foreground">
                      Medium
                    </dt>
                    <dd className="text-sm font-semibold">
                      {session.medium}
                    </dd>
                  </div>
                </div>
              </dl>

              <div className="mt-5">
                <p className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase">
                  <Users className="size-3.5" /> Classes
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {session.classes.map((name, index) => (
                    <div
                      key={name}
                      className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5 text-sm"
                    >
                      <span className="flex size-6 items-center justify-center rounded-lg bg-primary/10 text-[11px] font-bold text-primary">
                        {index + 1}
                      </span>
                      <span className="font-medium">{name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <p className="mt-auto flex items-center gap-2 pt-5 text-xs text-muted-foreground">
                <Clock className="size-3.5" />
                Runs {session.startMonth} to {session.endMonth} · schedule kept
                current by school administration
              </p>
            </article>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          {SCHOOL_INFO.name} keeps both calendars independent — morning
          families follow July–June, afternoon families follow
          January–December.
        </p>
      </div>
    </section>
  )
}

export default Sessions
