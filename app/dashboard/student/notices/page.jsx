"use client"

import PageHeader from "@/components/shared/page-header"
import NoticeBoard from "@/components/dashboard/notices/notice-board"
import { DbHint } from "@/components/dashboard/status"
import { useApi } from "@/hooks/use-api"
import { useRequireAuth } from "@/lib/auth-context"

export default function StudentNoticesPage() {
  useRequireAuth(["student"])

  // The server narrows this to school-wide + student notices (and any
  // notice targeted at the student's own class).
  const query = useApi("/api/notices?limit=50")

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Student Portal"
        title="Notices"
        description="Announcements from the school administration — for you and your guardians."
      />

      <NoticeBoard
        query={query}
        emptyTitle="No notices right now"
        emptyText="Notices published by the admin office will appear here for you and your guardians."
      />

      <div className="flex justify-end">
        <DbHint />
      </div>
    </div>
  )
}
