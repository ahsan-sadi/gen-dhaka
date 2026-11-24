import ModulePlaceholder from "@/components/dashboard/module-placeholder"

export default function AdminStudentsPage() {
  return (
    <ModulePlaceholder
      eyebrow="Control Center"
      title="Students"
      description="Admissions, enrollment into a session and class, roll numbers and student portal logins."
      iconName="gradCap"
      moduleTitle="Admissions & enrollment"
      moduleText="Student admission forms, class transfers, status changes and credential management arrive in the next build step."
      actionHref="/dashboard/admin"
    />
  )
}
