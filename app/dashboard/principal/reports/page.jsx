import ModulePlaceholder from "@/components/dashboard/module-placeholder"

export default function PrincipalReportsPage() {
  return (
    <ModulePlaceholder
      eyebrow="Office of the Principal"
      title="School Reports"
      description="Whole-school reports across staff, enrollment, classes and attendance."
      iconName="chart"
      moduleTitle="Reports & analytics"
      moduleText="Attendance summaries, staff composition and enrollment reports appear here once the attendance module is live."
      actionHref="/dashboard/principal"
    />
  )
}
