import ModulePlaceholder from "@/components/dashboard/module-placeholder"

export default function PrincipalNoticesPage() {
  return (
    <ModulePlaceholder
      eyebrow="Office of the Principal"
      title="Notices"
      description="School-wide announcements as published by the administration."
      iconName="message"
      moduleTitle="Notice board"
      moduleText="Notices published from the Admin dashboard will appear here for the Principal's review."
      actionHref="/dashboard/principal"
    />
  )
}
