import {
  ClipboardList,
  CalendarRange,
  LayoutDashboard,
  MessageSquare,
  UserRound,
  Users,
  UsersRound,
  BookOpen,
  GraduationCap,
  BarChart3,
} from "lucide-react"

/* Role-based sidebar navigation for /dashboard.
   Admin is the control center: every module the school runs is managed from
   here, and the other dashboards only ever read what the admin has set up. */

const profile = {
  href: "/dashboard/profile",
  label: "My Profile",
  icon: UserRound,
}

export function getNavItems(role) {
  if (role === "principal") {
    return [
      { href: "/dashboard/principal", label: "Overview", icon: LayoutDashboard },
      { href: "/dashboard/principal/reports", label: "School Reports", icon: BarChart3 },
      { href: "/dashboard/principal/notices", label: "Notices", icon: MessageSquare },
      profile,
    ]
  }

  if (role === "admin") {
    return [
      { href: "/dashboard/admin", label: "Overview", icon: LayoutDashboard },
      { href: "/dashboard/admin/staff", label: "Staff Management", icon: Users },
      { href: "/dashboard/admin/sessions", label: "Sessions & Classes", icon: CalendarRange },
      { href: "/dashboard/admin/students", label: "Students", icon: GraduationCap },
      { href: "/dashboard/admin/notices", label: "Notices", icon: MessageSquare },
      profile,
    ]
  }

  if (role === "teacher") {
    return [
      { href: "/dashboard/teacher", label: "Overview", icon: LayoutDashboard },
      { href: "/dashboard/teacher/my-classes", label: "My Classes", icon: BookOpen },
      { href: "/dashboard/teacher/attendance", label: "Attendance", icon: ClipboardList },
      { href: "/dashboard/teacher/students", label: "My Students", icon: UsersRound },
      profile,
    ]
  }

  return [
    { href: "/dashboard/student", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/student/attendance", label: "My Attendance", icon: ClipboardList },
    { href: "/dashboard/student/notices", label: "Notices", icon: MessageSquare },
    profile,
  ]
}

export default getNavItems
