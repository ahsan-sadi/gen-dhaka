import ModulePlaceholder from "@/components/dashboard/module-placeholder"

export default function StudentAttendancePage() {
  return (
    <ModulePlaceholder
      eyebrow="Student Portal"
      title="My Attendance"
      description="Your day-by-day attendance history for the current academic session."
      iconName="clipboard"
      moduleTitle="Attendance history"
      moduleText="Your attendance record will appear here as soon as teachers begin marking attendance in their classes."
      actionHref="/dashboard/student"
    />
  )
}
