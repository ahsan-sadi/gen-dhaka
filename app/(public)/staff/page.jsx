import { AlertTriangle, Users, UsersRound } from "lucide-react"

import PageHeader from "@/components/shared/page-header"
import StatCard from "@/components/shared/stat-card"
import StaffDirectory from "@/components/site/staff-directory"
import { SCHOOL_INFO } from "@/lib/constants"

export const metadata = {
  title: "Our Staff",
  description:
    "Meet the leadership, admin staff and teachers of BAFWWA GEN DHAKA — the people who run our Morning (English Medium) and Afternoon (English Version) sessions.",
}

/* Live data: the admin dashboard is the source of truth, so the directory is
   rendered per request instead of being baked into the build. */
export const dynamic = "force-dynamic"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

async function loadStaff() {
  try {
    const response = await fetch(`${API_BASE}/api/staff/public`, {
      cache: "no-store",
    })
    if (!response.ok) {
      return { items: [], failed: true, status: response.status }
    }
    const data = await response.json()
    return { items: Array.isArray(data) ? data : [], failed: false, status: 200 }
  } catch {
    return { items: [], failed: true, status: 0 }
  }
}

export default async function StaffPage() {
  const { items, failed, status } = await loadStaff()

  const leadership = items.filter((p) => p.role === "principal").length
  const admins = items.filter((p) => p.role === "admin").length
  const teachers = items.filter((p) => p.role === "teacher").length

  return (
    <>
      {/* ---------------------------- page header --------------------------- */}
      <section className="section border-b border-border/60">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">The people behind the school</p>
            <h1 className="section-title mt-3">
              Teaching &amp; Admin{" "}
              <span className="text-gradient">Staff</span>
            </h1>
            <p className="section-lead mx-auto">
              {SCHOOL_INFO.name} is run by a leadership team of 1 Principal, a
              control office of 8 Admin staff and 65 Teachers across the Morning
              (English Medium) and Afternoon (English Version) sessions — every
              record below is maintained by the school&apos;s admin dashboard.
            </p>
          </div>

          {/* ------------------------------ stats ------------------------------ */}
          <div className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-3">
            <StatCard
              label="Leadership"
              value={failed ? "—" : leadership}
              sublabel="Office of the Principal"
              icon={UsersRound}
              tone="violet"
            />
            <StatCard
              label="Admin Staff"
              value={failed ? "—" : admins}
              sublabel="Admission, Accounts, Office…"
              icon={Users}
              tone="sky"
            />
            <StatCard
              label="Teachers"
              value={failed ? "—" : teachers}
              sublabel="Across 6 classes, both sessions"
              icon={UsersRound}
              tone="primary"
            />
          </div>
        </div>
      </section>

      {/* ----------------------------- directory ---------------------------- */}
      <section className="section">
        <div className="container-page">
          {failed ? (
            <div
              className="mx-auto flex max-w-2xl items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-5 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200"
              role="alert"
            >
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <div>
                <p className="font-semibold">
                  The staff directory is temporarily unavailable
                </p>
                <p className="mt-1 leading-relaxed">
                  {status === 503
                    ? "The school database is not reachable right now — please try again shortly."
                    : "The school API is not running. Start it with npm start in backend-gen-dhaka and refresh this page."}
                </p>
              </div>
            </div>
          ) : items.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground">
              Staff records will appear here once they are created in the admin
              dashboard.
            </p>
          ) : (
            <StaffDirectory staff={items} />
          )}
        </div>
      </section>
    </>
  )
}
