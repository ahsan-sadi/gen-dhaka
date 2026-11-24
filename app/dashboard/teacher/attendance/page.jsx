import ModulePlaceholder from "@/components/dashboard/module-placeholder"

export default function TeacherAttendancePage() {
  return (
    <ModulePlaceholder
      eyebrow="Teacher Portal"
      title="Attendance"
      description="Mark daily attendance for your assigned classes — present, absent, late or leave."
      iconName="clipboard"
      moduleTitle="Daily attendance register"
      moduleText="The attendance register arrives in the attendance build step; entries will feed the Principal's reports immediately."
      actionHref="/dashboard/teacher"
    />
  )
}
