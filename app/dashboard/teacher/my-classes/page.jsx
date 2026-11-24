import ModulePlaceholder from "@/components/dashboard/module-placeholder"

export default function TeacherClassesPage() {
  return (
    <ModulePlaceholder
      eyebrow="Teacher Portal"
      title="My Classes"
      description="Your assigned classes with session details, schedules and rosters."
      iconName="book"
      moduleTitle="Class details"
      moduleText="Timetables, subject allocations and per-class rosters arrive once the timetable module is built."
      actionHref="/dashboard/teacher"
    />
  )
}
