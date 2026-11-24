# BAFWWA GEN DHAKA — Frontend

School management portal for **BAFWWA GEN DHAKA** — a play school running two
sessions under one roof:

| Session | Medium | Academic year | Classes |
| --- | --- | --- | --- |
| Morning | **English Medium** | July → June | Play Group · Nursery-I · Nursery-II · KG |
| Afternoon | **English Version** | January → December | Play Group · Nursery |

Everything is **created and controlled by the Admin dashboard**; the other
dashboards only read that verified data.

Built with **Next.js 16 (App Router) · Tailwind CSS v4 · shadcn/ui (Base UI) ·
plain JavaScript**, talking to the Express + MongoDB API in
`backend-gen-dhaka/`.

## Getting started

```bash
# 1. backend (port 8000)
cd backend-gen-dhaka
npm install
npm run seed      # 1 principal, 8 admins, 65 teachers, 50 support, 6 classes, 36 students
npm start

# 2. frontend (port 3000)
cd frontend-gen-dhaka
npm install
npm run dev
```

`.env` → `NEXT_PUBLIC_API_URL=http://localhost:8000`

## Demo logins (password `123456`)

| Dashboard | Email |
| --- | --- |
| Principal | `principal@bafwwa.edu.bd` |
| Admin (control center) | `admin@bafwwa.edu.bd` |
| Teacher | `teacher@bafwwa.edu.bd` |
| Student | `student@bafwwa.edu.bd` |

Supporting staff have **no login** — their records are managed by the Admin
dashboard only. There is no public sign-up: accounts are created by the admin
office.

## Dashboards

- **Admin** (`/dashboard/admin`) — the control center: staff management
  (quotas 1 / 8 / 65 / 50 enforced), sessions & classes, admissions, notices.
- **Principal** (`/dashboard/principal`) — whole-school stats, staff
  composition, enrollment, reports, notices.
- **Teacher** (`/dashboard/teacher`) — assigned classes, student counts,
  attendance entry.
- **Student** (`/dashboard/student`) — personal record, class & session,
  attendance, notices.
- Shared `/dashboard/profile` — self-service contact details; role, class and
  session stay admin-controlled.

## Project structure

```
app/
  (public)/           # school landing, about, staff directory, sign-in (navbar + footer shell)
  dashboard/          # role-based dashboards (layout = guard + sidebar + topbar)
components/
  site/               # navbar, footer, logo, theme toggle
  home/               # landing sections (hero, sessions, portal)
  dashboard/          # sidebar, topbar, nav-config, status helpers
  shared/             # page-header, stat-card, role-badge, empty-state, skeletons
  ui/                 # shadcn/ui (Base UI) kit
lib/
  constants.js        # sessions, classes, roles, quotas, demo accounts
  api.js              # fetch client + token storage
  auth-context.jsx    # useAuth / useRequireAuth / dashboardHome
hooks/
  use-api.js          # GET-data hook ({ data, error, loading, refetch })
docs/CONVENTIONS.md   # design system + data-layer contract
```

## Conventions

See [`docs/CONVENTIONS.md`](docs/CONVENTIONS.md) — read it before writing any
code. Key rules: plain JavaScript only (no TypeScript), Next.js 16 conventions
(awaited `params`, `error.jsx` with `{ error, retry }`, `render` prop instead
of `asChild`), sonner toasts for every API outcome.

## Build

```bash
npm run build   # must always pass
```
# gen-dhaka
