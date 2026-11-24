import ModulePlaceholder from "@/components/dashboard/module-placeholder"

export default function AdminNoticesPage() {
  return (
    <ModulePlaceholder
      eyebrow="Control Center"
      title="Notices"
      description="Publish announcements to the Principal, Teachers and Students dashboards in one action."
      iconName="message"
      moduleTitle="Notice publisher"
      moduleText="Compose and publish notices that show up instantly on the Principal, Teacher and Student dashboards."
      actionHref="/dashboard/admin"
    />
  )
}
