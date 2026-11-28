# BAFWWA GEN DHAKA — Frontend Conventions (read before writing any code)

> Next.js 16 (App Router) project written in **plain JavaScript** (no
> TypeScript). Data comes from the Express + MongoDB API in
> `backend-gen-dhaka` — there is **no mock store**.

## 1. Stack facts (Next.js 16 — differences from older Next)

- `params` / `searchParams` in **server** pages are **Promises** → `const { id } = await params`.
- In **client** pages use `useParams()` / `useSearchParams()` from `next/navigation`.
- `error.jsx` exports a client component receiving **`{ error, retry }`** (NOT `reset`).
- `loading.jsx`, `not-found.jsx` work as usual. Error boundaries must be client components.
- Turbopack is the default bundler. `next build` does NOT run lint.
- shadcn components are built on **Base UI**, not Radix:
  - Composing a link/button: use the **`render` prop**, never `asChild`:
    `<Button render={<Link href="/about" />}>About</Button>`
  - Menu items use **`onClick`**, not `onSelect`.
  - `DropdownMenuLabel` must sit inside a `DropdownMenuGroup` — Base UI's
    `Menu.GroupLabel` requires `Menu.Group` context; a bare label crashes the
    menu on open ("MenuGroupContext is missing").
  - `Sheet`/`Dialog` need `SheetTitle`/`DialogTitle` for a11y.
- **React Server Components boundary:** a server component can never pass a
  *function* (e.g. a Lucide icon component) as a prop into a `"use client"`
  component — pass strings/primitives instead and resolve the icon inside the
  client tree (`components/dashboard/module-placeholder.jsx` shows the pattern).
- `npm run build` must always pass before you finish.

## 2. Design system (Modern SaaS · indigo/violet)

Brand: indigo→violet gradient, Geist Sans body, **Plus Jakarta Sans headings** (`font-heading`).

Global helpers already defined in `app/globals.css` — use them instead of ad-hoc padding:

| Class | Purpose |
|---|---|
| `container-page` | max-w-7xl horizontal container (all sections/headers) |
| `section` | vertical section padding (py-16 md:py-24) |
| `section-title` | h2 style: `text-3xl sm:text-4xl font-extrabold tracking-tight` |
| `section-lead` | muted paragraph under a section title |
| `eyebrow` | small pill label above titles (`<p className="eyebrow">…</p>`) |
| `text-gradient` | indigo→fuchsia gradient text (use sparingly, e.g. one phrase per heading) |
| `card-hover` | lift + shadow on hover (cards) |

Rules:
- All headings use `font-heading` + `font-extrabold tracking-tight`.
- Cards: `rounded-2xl border border-border bg-card`, equal height via `flex h-full flex-col`.
- Grids: `grid gap-6 sm:grid-cols-2 lg:grid-cols-3` (3-up), `gap-4 sm:grid-cols-2 xl:grid-cols-4` for stats.
- Buttons: always the shadcn `Button` (`variant="default" | "outline" | "ghost" | "secondary" | "destructive"`, `size="sm" | "default" | "lg" | "icon-sm"`). Primary = indigo. Don't invent new button styles.
- Avatars: never hardcode a path — `avatarUrl(person)` from `@/lib/utils`
  returns the stored image or a deterministic Dicebear initials avatar.
- Fully responsive: mobile-first, test `sm:` breakpoints, use `Sheet` for mobile menus.

## 3. UI kit (components/ui — already converted to JSX)

Available (import from `@/components/ui/<name>`):
`button, badge, card (Card/CardHeader/CardTitle/CardDescription/CardContent/CardFooter), input, label, textarea, select (Select/SelectTrigger/SelectValue/SelectContent/SelectItem), dialog, alert-dialog, sheet, dropdown-menu, tabs, table (Table/TableHeader/TableBody/TableHead/TableRow/TableCell), skeleton, separator, switch, checkbox, radio-group, avatar, tooltip, popover, accordion, empty (Empty/EmptyHeader/EmptyMedia/EmptyTitle/EmptyDescription/EmptyContent), alert, spinner, pagination, kbd, scroll-area`

Shared project components:
- `@/components/shared/page-header` → `<PageHeader eyebrow title description actions />`
- `@/components/shared/stat-card` → `<StatCard label value sublabel icon={Icon} tone="primary|violet|emerald|amber|rose|sky" />`
- `@/components/shared/role-badge` → `<RoleBadge role />`, `<StatusBadge status label />`
- `@/components/shared/empty-state` → `<EmptyState icon title description actionLabel actionHref />`
- `@/components/shared/skeletons` → `CardSkeleton, CardGridSkeleton, StatCardSkeleton, StatsGridSkeleton, TableSkeleton, PageSkeleton`
- `@/components/dashboard/status` → `<BackendAlert error />`, `<LoadingRow label />`, `<DbHint />`
- `@/components/dashboard/module-placeholder` → sidebar-complete shell for modules still being built (pass `iconName`, not an icon component)

**Built modules (import the same way):**

- `@/components/dashboard/staff/staff-form` → `<StaffFormDialog open onOpenChange staff stats onSaved />` — create/edit a staff member, quota banner included
- `@/components/dashboard/staff/staff-table` → `<StaffTable rows loading currentUserId onEdit onChanged />`, plus `<StaffTableError error onRetry />`
- `@/components/dashboard/staff/quota-bar` → `<QuotaBar used limit />` and `QUOTA_TONES`
- `@/components/dashboard/sessions/session-form` → `<SessionFormDialog … onRequestDelete />` and `<SessionActiveSwitch session onSaved />`
- `@/components/dashboard/sessions/class-form` → `<ClassFormDialog open onOpenChange klass sessions teachers defaultSessionId onSaved onRequestDelete />`
- `@/components/dashboard/students/student-form` → `<StudentFormDialog open onOpenChange student onSaved />` — admissions dialog with session→class cascade. `POST` auto-assigns `studentId` + the class's next roll number (password defaults to `123456`); on edit, `rollNo` is only sent when typed by hand so a class transfer can auto-assign the new roll server-side.
- `@/components/dashboard/students/students-table` → `<StudentsTable rows loading currentUserId onEdit onChanged />`, plus `<StudentsTableError error onRetry />`
- `@/components/dashboard/teacher/roster-table` → `<RosterTable rows loading emptyHint />` (read-only, teachers), plus `<RosterTableError error onRetry />`
- `@/hooks/use-teacher-scope` → `useTeacherScope(user)` → `{ classes, students, countFor, loading, error, refetch }` — the classes where `user` is class teacher plus their enrolled students (one `classId` query per class)

Every dialog takes `onSaved` (refetch) and reports outcomes with `sonner` toasts; `onRequestDelete` opens the shared `AlertDialog` confirm held by the page.

- `@/components/site/navbar`, `@/components/site/footer`, `@/components/site/logo`, `@/components/site/theme-toggle`

## 4. Data layer (the API)

```js
import { api, ApiError } from "@/lib/api"          // fetch client (Bearer token)
import { useApi } from "@/hooks/use-api"           // GET hook
import { useAuth, useRequireAuth, dashboardHome } from "@/lib/auth-context"
```

`useApi(path)` → `{ data, error, loading, refetch }` (re-fetches when `path`
changes; `enabled: false` pauses it).

Low-level calls — **always handle the thrown `ApiError`**:

```js
try {
  const result = await api.post("/api/staff", payload)
} catch (error) {
  toast.error(error.message)     // server's { error } message
}
const list = await api.get("/api/staff?role=teacher&q=rumi")
await api.patch("/api/staff/:id", patch)
await api.del("/api/staff/:id")

// students — list returns { items, total, page, pages }
const students = await api.get("/api/students?sessionId=&classId=&status=&q=&page=&limit=")
await api.post("/api/students", payload)    // 201 · auto studentId + rollNo · password defaults to 123456
await api.patch("/api/students/:id", patch) // admin edits incl. class transfer (auto next rollNo) · self = name/phone/address/guardianPhone + own password
await api.del("/api/students/:id")          // admin only (403 otherwise)

// fees — months are `YYYY-MM`; dues are computed server-side per month
const structures = await api.get("/api/fees/structures")     // { items: [{ classId, className, sessionName, structure|null }] }
await api.put("/api/fees/structures/:classId", { monthlyFee, admissionFee, transportFee, notes }) // admin upsert
const dues = await api.get("/api/fees/dues?month=2026-11")   // { month, items[expected|paid|due|status], totals }
await api.post("/api/fees/payments", { studentId, month, amount, method, reference, note, paidAt }) // admin
await api.del("/api/fees/payments/:id")                      // admin voids a receipt
const mine = await api.get("/api/fees/me")                   // student-only (403 for staff)

// auth — the JWT always carries `role` (students included), so guards work
const me = await api.get("/api/auth/me")     // current account (200)
await api.patch("/api/auth/profile", patch) // self-service: name/phone/address/guardianPhone (+ own password)
```

API base: `NEXT_PUBLIC_API_URL` (default `http://localhost:8000`). Errors are
`{ error: string }` with real HTTP statuses (401 auth · 403 role · 409
conflict/quota · 503 DB unavailable).

Auth helpers:

```js
const { user, isAuthenticated, role, hydrated, signIn, signOut, refreshUser } = useAuth()
const { user, ready } = useRequireAuth(["teacher"])  // guards + redirects, use in dashboards
dashboardHome(role)  // '/dashboard/principal' | '/dashboard/admin' | '/dashboard/teacher' | '/dashboard/student'
```

`signIn({ email, password })` → `{ ok, user?, error? }`. Tokens live in
localStorage; the cached user revalidates against `GET /api/auth/me` on load.

Demo accounts (password `123456`): `principal@ / admin@ / teacher@ / student@
bafwwa.edu.bd`.

## 5. School domain (fixed — never invent your own)

Constants live in `@/lib/constants`:

- `SESSIONS` — Morning Session (English Medium, **July → June**,
  Play Group/Nursery-I/Nursery-II/KG) and Afternoon Session (English Version,
  **January → December**, Play Group/Nursery). Each entry carries `accent`,
  `ring` and `classes` for consistent UI.
- `ROLES` / `ROLE_LABELS` — `principal | admin | teacher | student`
  (`support` = Supporting Staff, record-only, **no login**).
- `STAFF_QUOTAS` — enforced server-side limits: 1 Principal, 8 Admin;
  Teacher/Support effectively unlimited (9999) so Admin can add/edit/delete
  freely (409 on breach). **Quota labels must read from `STAFF_QUOTAS`.**
- `STAFF_HEADCOUNT` — the school structure (1 / 8 / 65 / 50) used for public
  stats (hero, about) and dashboard count fallbacks — never for quota labels.
- `DEPARTMENTS`, `TEACHER_SUBJECTS`, `SUPPORT_DUTIES`, `STATUS_STYLES`,
  `DEMO_ACCOUNTS`, `SCHOOL_INFO`, `formatMoney`, `formatDate`.
- **Fees:** `FEE_METHODS` / `FEE_METHOD_LABELS` (cash, bKash, Nagad, bank,
  cheque, card), `FEE_STATUS_LABELS` (`paid | partial | due | no-fee`),
  `currentMonth()` → `YYYY-MM`, `formatMonth()` → "November 2026".
  `STATUS_STYLES` already carries `paid`/`partial`/`due` pills — reuse
  `StatusBadge` instead of inventing new colors. Money always renders through
  `formatMoney`.

List responses may be a bare array **or** an envelope — normalise with
`toList(data, "staff")` / `docId(doc)` from `@/lib/utils`.

## 6. Page conventions

- Public pages live in **`app/(public)/`** (they get Navbar + Footer via the layout).
- Public pages that show live school data (home principal + notices
  sections, `/staff`) are **server components** that fetch no-auth endpoints
  (`GET /api/staff/public`, `GET /api/notices/public`) with
  `cache: "no-store"` and export `export const dynamic = "force-dynamic"`.
  Home sections live in `components/home/*`; hide the section (return `null`)
  instead of erroring when the record is missing.
- Dashboard pages live in **`app/dashboard/<role>/`** (sidebar shell layout).
- Every dashboard section gets a `loading.jsx` using the shared skeletons
  (role-level `loading.jsx` covers child routes).
- Forms: controlled `useState`, validate before submit, `pending` state on the button
  (`disabled={pending}` + spinner), toast on success/error (`sonner`), reset on success.
- Dates: `formatDate(...)` → `06 Mar 2026`.
- Print actions call `window.print()` from a client page; hide chrome with
  `print:hidden` and swap borders via `print:border-gray-400` (see the
  principal reports page).
- Every sidebar link must have a real route from day one — use
  `ModulePlaceholder` until the module is built.
- Never add TypeScript. Never touch `components/ui/*` unless it's a bug fix.
- Metadata: export `export const metadata = { title: "…" }` from **server**
  pages only (client pages can't export metadata — skip it there).

## 7. File ownership

Shared files (`lib/constants.js`, `lib/api.js`, `lib/auth-context.jsx`, the
`components/ui` kit, navbar/layout) are shared — extend them carefully and keep
existing exports intact.
