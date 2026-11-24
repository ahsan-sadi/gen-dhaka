import ModulePlaceholder from "@/components/dashboard/module-placeholder"

export default function StudentNoticesPage() {
  return (
    <ModulePlaceholder
      eyebrow="Student Portal"
      title="Notices"
      description="Announcements from the school administration."
      iconName="message"
      moduleTitle="Notice board"
      moduleText="Notices published by the Admin dashboard will appear here for you and your guardians."
      actionHref="/dashboard/student"
    />
  )
}
