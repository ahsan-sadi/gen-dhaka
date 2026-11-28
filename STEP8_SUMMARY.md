## Summary of completed work

### Steps 1–7 (all complete ✅)
- **Step 1** — Foundation: Next.js 16 scaffold, MentorLagbe deleted, auth JWT login, core layout
- **Step 2** — Admin staff: staff CRUD, quota enforcement (1 principal / 8 admin / 65 teachers / 50 support), demo accounts `123456`
- **Step 3** — Sessions & classes: two fixed sessions (Morning = English Medium Jul→Jun, Afternoon = English Version Jan–Dec), class caps, cross-session name‑ambiguity fix (`className` AND `sessionName`)
- **Step 4** — Students & admissions: `student-form.jsx` with `set(field)` cascade, rollNo only sent when hand‑edited, password only on create; `students-table.jsx` 6 headers; admin page with envelope pagination, status chips, filter strips, stats cards
- **Step 5** — Teacher dashboard: `useTeacherScope` hook, roster table, my‑classes page with session‑grouped cards, seat bars, “you” badge, deep links
- **Step 6** — Student dashboard: overhauled overview page; exact `classId` classmates stat; new “My classmates” roster section; critical JWT role‑claim fix (`signToken({ ...student, role: "student" })`); self‑edit profile/password; class-teacher row; 12/12 headless checks; build green
- **Step 7** — Principal dashboard: overview cross-session bug fixed (`byClass` now checks `sessionName`); new `app/dashboard/principal/reports/page.jsx` with totals strip + Print button + staff composition quota table (1/1, 8/8, 65/65, 50/50) + enrollment‑by‑session cards + per‑class table with teacher/seats; `window.print()` convention

### Step 8 — Notices & Attendance (complete ✅)
- **Backend**: two new routes (`/api/notices`, `/api/attendance` + `/me`, `/summary`) mounted in `index.js`; role‑filtered visibility; audience targeting; class‑targeted notices (JWT carries no `classId` → one DB lookup per student); attendance per‑class‑per‑day upsert; admin + principal full read; teachers read their own classes; students own‑history only
- **Frontend**: 6 pages replacing former `ModulePlaceholder`s; 2 component dirs (`components/dashboard/notices/`); lib constants for notices/audiences/priorities and attendance statuses/labels; all patterns mirror proven conventions (DialogFooter inside `<form>`; `set(field)`; `cn()`; `print:hidden`/`print:border-gray-400`); class‑targeting verified live (demo student sees only their‑class targeted notice; other classes hidden)

### Build / runtime status
- `npm run build` → 24 routes green, no errors
- Dev servers: frontend `:3000` (background), backend `:8000` (nodemon + Atlas `bafwwa_gen_dhaka`)
- All headless Chrome DOM checks: 0 error surfaces across all verified pages
- Probe `app/staff-test-auth` removed permanently

### Files added / modified
| Category | Files |
|---|---|
| Backend routes | `backend-gen-dhaka/src/routes/notices.js`, `backend-gen-dhaka/src/routes/attendance.js`, `index.js` (mount) |
| Frontend pages | `app/dashboard/admin/notices/page.jsx`, `app/dashboard/principal/notices/page.jsx`, `app/dashboard/teacher/notices/page.jsx`, `app/dashboard/student/notices/page.jsx`, `app/dashboard/teacher/attendance/page.jsx`, `app/dashboard/student/attendance/page.jsx`, `app/dashboard/principal/reports/page.jsx`, `app/dashboard/principal/page.jsx` (cross-session bug fix) |
| New components | `components/dashboard/notices/notice-form.jsx`, `components/dashboard/notices/notices-table.jsx`, `components/dashboard/notices/notice-board.jsx`, `components/dashboard/students/student-form.jsx` (rewritten), `components/dashboard/students/students-table.jsx` (existing + confirmed) |
| Lib constants | `frontend-gen-dhaka/lib/constants.js` (NOTICE_AUDIENCES, NOTICE_PRIORITIES, ATTENDANCE_STATUSES) |
| Nav config | `components/dashboard/nav-config.js` (teacher notices item) |
| Probe cleanup | `app/staff-test-auth` deleted |