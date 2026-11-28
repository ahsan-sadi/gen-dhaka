# Step 9 — Fees & Payments module

**Goal:** the Admin dashboard becomes the school's accounts office: it sets what
each class owes, books every receipt, and shows dues in real time. Students see
exactly the same numbers under **My Fees**. Backend + frontend, no mocks.

## Backend (`backend-gen-dhaka`)

**New route:** `src/routes/fees.js`, mounted as `app.use("/api/fees", feeRoutes)`
in `index.js` (nodemon auto-reloads).

**Collections**

| Collection | One doc per | Key fields |
|---|---|---|
| `feeStructures` | class | `classId`, `sessionId`, `monthlyFee`, `admissionFee`, `transportFee`, `notes`, `updatedByName` |
| `feePayments` | receipt | `studentId`, `classId`, `month` (`YYYY-MM`), `amount`, `method`, `reference`, `note`, `paidAt` (`YYYY-MM-DD`), `recordedByName` |

Dues are always **computed on read** (structure expected − receipts booked for
the month), so changing a fee can never leave stale balances.

**Endpoints**

| Method | Path | Who | Purpose |
|---|---|---|---|
| GET | `/api/fees/structures` | admin, principal | every class joined with its structure + session name |
| PUT | `/api/fees/structures/:classId` | admin | upsert a class's monthly/admission/transport fees |
| DELETE | `/api/fees/structures/:classId` | admin | clear a class's structure |
| GET | `/api/fees/payments?month=&classId=` | admin, principal | receipts (live student names refreshed), latest 300 |
| POST | `/api/fees/payments` | admin | record a receipt (validates month, amount, method) |
| DELETE | `/api/fees/payments/:id` | admin | void a receipt |
| GET | `/api/fees/dues?month=` | admin, principal | per-student expected/paid/due + totals for the month |
| GET | `/api/fees/me` | student | own fee breakdown, month balance, receipt history |

**Rules:** `month` must match `YYYY-MM`; amounts 0–10,000,000 (rounded ×100);
methods ∈ `cash, bkash, nagad, bank, cheque, card`; errors always `{ error }`;
status per student: `paid` / `partial` / `due` / `no-fee` (class has no
structure). Writes are **admin-only**; principal gets read-only.

## Frontend (`frontend-gen-dhaka`)

- `lib/constants.js` — `FEE_METHODS`, `FEE_METHOD_LABELS`,
  `FEE_STATUS_LABELS`, `currentMonth()` (`YYYY-MM`), `formatMonth()`
  ("2026-11" → "November 2026"); `STATUS_STYLES` gained `paid`/`partial`/`due`.
- `lib/api.js` — added `api.put` (structures are PUT-upserted).
- `components/dashboard/nav-config.js` — admin **Fees & Payments** (Wallet),
  student **My Fees** (Wallet).
- `components/dashboard/fees/payment-form.jsx` — receipt dialog: student picker
  (paged fetch of active students + client-side filter once > 6 names), month,
  amount, method, received-on, reference, note.
- `components/dashboard/fees/structure-form.jsx` — class fee dialog (upsert;
  class select disabled in edit mode).
- `app/dashboard/admin/fees/page.jsx` — month bar + 4 stats + **Dues table**
  (search, status badges) + **Fee structures by class** (Manage menu:
  Edit/Set fee, Remove structure) + **Receipts** (Manage menu: Void payment,
  AlertDialog confirm). Dues and receipts both follow the month picker.
- `app/dashboard/student/fees/page.jsx` — stats, fee breakdown (with the
  office notes + due banner), payment history table.

## Verification

- **24/24 API checks** (`fees-api-test.mjs`): CRUD + validation (bad month/amount
  → 400, unknown class → 404), dues math (expected 3,500 − paid 3,500 = 0 →
  `paid`), `/me` mirror, role guards (teacher 403 on dues/payments, admin 403
  on `/me`, anonymous 401).
- **26/26 headless checks** (`cdp-fees-test.mjs`, real pointer clicks):
  37 dues rows / 6 structure rows / receipt rows, stats text, Manage menus open
  with **no** `MenuGroupContext` error (DropdownMenuGroup rule respected),
  Record-payment dialog opens with 44 students + bKash + month, a payment
  recorded **through the UI** appears and updates totals, student page renders
  with history, **0 page exceptions**. Test receipt voided after capture.
- `npm run build` — **26/26 routes green** (was 24).

## Demo data seeded (all editable/deletable from the UI)

- Fee structure for **all 6 classes**: ৳3,500 monthly, ৳5,000 admission,
  ৳0 transport, note "Payable by the 10th of each month at the accounts office."
- One receipt: ৳3,500 bKash (TRX98765) for the demo student, November 2026 →
  their **My Fees** shows Paid / ৳0 due.
- School totals for Nov 2026: expected ৳129,500 · paid ৳3,500 · due ৳126,000
  across 37 students.
