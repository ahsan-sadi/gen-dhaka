/* BAFWWA GEN DHAKA — school domain constants shared by landing pages & dashboards */

export const APP_NAME = "BAFWWA GEN DHAKA"

export const SCHOOL_INFO = {
  name: "BAFWWA GEN DHAKA",
  tagline: "English Medium & English Version Play School",
  motto: "Learning Today, Leading Tomorrow",
  address: "BAF Wings Enclave, Dhaka Cantonment, Dhaka-1206, Bangladesh",
  phone: "+880 1700-000000",
  email: "info@bafwwa.edu.bd",
  founded: 1998,
}

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/#sessions", label: "Sessions" },
  { href: "/staff", label: "Our Staff" },
  { href: "/about", label: "About" },
]

/* ---------------------------------------------------------------- sessions */
/* Two fixed academic sessions — Morning = English Medium (July–June),
   Afternoon = English Version (January–December). Admin can toggle the active
   session, but the structure itself is part of the school's identity.        */

export const SESSIONS = [
  {
    id: "morning",
    name: "Morning Session",
    medium: "English Medium",
    period: "July to June",
    startMonth: "July",
    endMonth: "June",
    sortOrder: 1,
    classes: ["Play Group", "Nursery-I", "Nursery-II", "KG"],
    accent: "from-indigo-500 to-violet-500",
    ring: "ring-indigo-500/20",
  },
  {
    id: "afternoon",
    name: "Afternoon Session",
    medium: "English Version",
    period: "January to December",
    startMonth: "January",
    endMonth: "December",
    sortOrder: 2,
    classes: ["Play Group", "Nursery"],
    accent: "from-fuchsia-500 to-pink-500",
    ring: "ring-fuchsia-500/20",
  },
]

export const SESSION_IDS = SESSIONS.map((session) => session.id)

export const sessionById = (id) => SESSIONS.find((session) => session.id === id)

export const CLASSES_BY_SESSION = {
  morning: SESSIONS[0].classes,
  afternoon: SESSIONS[1].classes,
}

/* ------------------------------------------------------------------ people */
/* Dashboard roles (who can sign in). Supporting staff are records managed
   entirely by the Admin dashboard — they never log in.                        */

export const ROLES = ["principal", "admin", "teacher", "student"]

export const ROLE_LABELS = {
  principal: "Principal",
  admin: "Admin Staff",
  teacher: "Teacher",
  student: "Student",
  support: "Supporting Staff",
}

export const ROLE_ACCENT = {
  principal: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:border-violet-500/30",
  admin: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/30",
  teacher: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/30",
  student: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30",
  support: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30",
}

/* Staff categories + hard head-count quotas (enforced by the admin API) */
export const STAFF_ROLES = ["principal", "admin", "teacher", "support"]

export const STAFF_QUOTAS = { principal: 1, admin: 8, teacher: 9999, support: 9999 }

/* The school's head-count structure (public stats + dashboard fallbacks).
   Teacher/Support are deliberately uncapped in STAFF_QUOTAS — the Admin can
   add as many as needed, so quota labels must read from STAFF_QUOTAS. */
export const STAFF_HEADCOUNT = {
  principal: 1,
  admin: 8,
  teacher: 65,
  support: 50,
  students: null, // grows with admissions
}

export const DEPARTMENTS = [
  "Accounts",
  "Admission",
  "Office",
  "IT",
  "Examination",
  "Library",
  "Transport",
  "Registry",
]

export const TEACHER_SUBJECTS = [
  "English",
  "Bangla",
  "Mathematics",
  "Science",
  "Art & Craft",
  "Music",
  "Physical Education",
  "Islamic Studies",
  "Computer Basics",
]

export const SUPPORT_DUTIES = [
  "Guard",
  "Cleaner",
  "Cook",
  "Nurse",
  "Peon",
  "Driver",
  "Gardener",
]

export const STAFF_STATUS = ["active", "inactive"]
export const STUDENT_STATUS = ["active", "inactive"]

/* ---------------------------------------------------------------- notices */
/* Who a notice reaches. `all` = whole school; class targeting (optional)
   narrows any audience down to one class on top of the audience rule.     */
export const NOTICE_AUDIENCES = ["all", "staff", "teachers", "students"]

export const NOTICE_AUDIENCE_LABELS = {
  all: "Everyone",
  staff: "All staff",
  teachers: "Teachers",
  students: "Students",
}

export const NOTICE_PRIORITIES = ["normal", "important", "urgent"]

export const NOTICE_PRIORITY_LABELS = {
  normal: "Normal",
  important: "Important",
  urgent: "Urgent",
}

/* ------------------------------------------------------------ attendance */
export const ATTENDANCE_STATUSES = ["present", "absent", "late", "leave"]

export const ATTENDANCE_LABELS = {
  present: "Present",
  absent: "Absent",
  late: "Late",
  leave: "Leave",
}

/* ------------------------------------------------------------------ fees */
/* Monthly fees are configured per class by the Admin (fee structures);
   receipts are booked against a YYYY-MM month. Students see their own
   balance + history under "My Fees".                                     */
export const FEE_METHODS = ["cash", "bkash", "nagad", "bank", "cheque", "card"]

export const FEE_METHOD_LABELS = {
  cash: "Cash",
  bkash: "bKash",
  nagad: "Nagad",
  bank: "Bank Transfer",
  cheque: "Cheque",
  card: "Card",
}

export const FEE_STATUS_LABELS = {
  paid: "Paid",
  partial: "Partly paid",
  due: "Due",
  "no-fee": "No fee set",
}

/** Current calendar month as YYYY-MM — the key every receipt is booked under. */
export const currentMonth = () => new Date().toISOString().slice(0, 7)

/** "2026-11" → "November 2026" */
export const formatMonth = (value) => {
  const [year, month] = String(value || "").split("-")
  if (!year || !month) return "—"
  return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString(
    "en-GB",
    { month: "long", year: "numeric" },
  )
}

/* ------------------------------------------------------------------ shared */
export const STATUS_STYLES = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30",
  inactive: "bg-muted text-muted-foreground border-border",
  present: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30",
  absent: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/30",
  late: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30",
  leave: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/30",
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30",
  partial: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30",
  due: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/30",
  pending: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30",
  rejected: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/30",
  principal: ROLE_ACCENT.principal,
  admin: ROLE_ACCENT.admin,
  teacher: ROLE_ACCENT.teacher,
  student: ROLE_ACCENT.student,
  support: ROLE_ACCENT.support,
}

/* Demo logins (created by `npm run seed` in backend-gen-dhaka) */
export const DEMO_ACCOUNTS = [
  { email: "principal@bafwwa.edu.bd", password: "123456", role: "principal" },
  { email: "admin@bafwwa.edu.bd", password: "123456", role: "admin" },
  { email: "teacher@bafwwa.edu.bd", password: "123456", role: "teacher" },
  { email: "student@bafwwa.edu.bd", password: "123456", role: "student" },
]

export const formatMoney = (amount) => `৳${Number(amount || 0).toLocaleString()}`
export const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—"
