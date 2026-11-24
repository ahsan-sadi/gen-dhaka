import ModulePlaceholder from "@/components/dashboard/module-placeholder"

export default function TeacherStudentsPage() {
  return (
    <ModulePlaceholder
      eyebrow="Teacher Portal"
      title="My Students"
      description="Student lists for the classes you teach."
      iconName="usersRound"
      moduleTitle="Class rosters"
      moduleText="Searchable rosters with guardian contacts and student details arrive in the next build step."
      actionHref="/dashboard/teacher"
    />
  )
}
