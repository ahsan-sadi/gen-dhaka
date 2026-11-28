import { Award, CalendarDays, Quote, ShieldCheck } from "lucide-react"

import { avatarUrl } from "@/lib/utils"
import { SCHOOL_INFO } from "@/lib/constants"

/* Public landing section introducing the Principal — placed right below the
   hero. Data comes from the same public directory the /staff page uses, so
   the Admin dashboard (Staff Management) stays the single source of truth. */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

async function loadPrincipal() {
  try {
    const response = await fetch(`${API_BASE}/api/staff/public`, {
      cache: "no-store",
    })
    if (!response.ok) return null
    const items = await response.json()
    const list = Array.isArray(items) ? items : []
    return list.find((person) => person.role === "principal") || null
  } catch {
    return null
  }
}

export async function Principal() {
  const principal = await loadPrincipal()

  /* Never break the landing page — hide the section if the record is
     missing (e.g. API down or no principal record yet). */
  if (!principal) return null

  const years =
    principal.joinedYear && Number(principal.joinedYear) < new Date().getFullYear()
      ? `${new Date().getFullYear() - Number(principal.joinedYear)}+ years`
      : null

  return (
    <section
      id="principal"
      className="section scroll-mt-20 border-b border-border"
    >
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Message from the Principal</p>
          <h2 className="section-title mt-3">
            Lead by <span className="text-gradient">{principal.name}</span>
          </h2>
          <p className="section-lead mt-4">
            Every decision at {SCHOOL_INFO.name} starts with the well-being and
            growth of our little learners — guided by our Principal and carried
            out by the administration.
          </p>
        </div>

        <article className="card-hover mx-auto mt-12 flex max-w-4xl flex-col gap-8 rounded-2xl border border-border bg-card p-6 sm:p-8 md:flex-row md:items-center">
          {/* portrait */}
          <div className="relative mx-auto w-56 shrink-0 md:mx-0 lg:w-64">
            <div className="overflow-hidden rounded-2xl border border-border bg-muted">
              <img
                src={avatarUrl({ name: principal.name, image: principal.image })}
                alt={principal.name}
                className="aspect-square w-full object-cover object-top"
              />
            </div>
            <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-border bg-background px-3 py-1 text-[11px] font-semibold text-muted-foreground shadow-sm md:left-4 md:translate-x-0">
              {principal.employeeId}
            </span>
          </div>

          {/* details */}
          <div className="min-w-0 text-center md:text-left">
            <div className="flex items-center justify-center gap-2 md:justify-start">
              <ShieldCheck className="size-4 text-primary" />
              <p className="eyebrow !mb-0">Principal</p>
            </div>
            <p className="mt-2 font-heading text-2xl font-extrabold tracking-tight sm:text-3xl">
              {principal.name}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {principal.qualification}
              {principal.department ? ` · ${principal.department}` : ""}
            </p>

            <blockquote className="mt-5 rounded-xl border border-border bg-background p-4 text-left">
              <Quote className="size-4 text-primary" />
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                “A warm welcome to {SCHOOL_INFO.name}. Our doors are open to
                every child who walks through them — we nurture curiosity,
                kindness and confidence from the very first day, across both
                our Morning and Afternoon sessions.”
              </p>
            </blockquote>

            <dl className="mt-5 flex flex-wrap justify-center gap-3 md:justify-start">
              <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2">
                <CalendarDays className="size-4 text-primary" />
                <div>
                  <dt className="text-[11px] text-muted-foreground">Serving since</dt>
                  <dd className="text-sm font-semibold">
                    {principal.joinedYear || "—"}
                  </dd>
                </div>
              </div>
              {years && (
                <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2">
                  <Award className="size-4 text-primary" />
                  <div>
                    <dt className="text-[11px] text-muted-foreground">Experience</dt>
                    <dd className="text-sm font-semibold">{years}</dd>
                  </div>
                </div>
              )}
            </dl>
          </div>
        </article>
      </div>
    </section>
  )
}

export default Principal
