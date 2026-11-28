"use client"

import PageHeader from "@/components/shared/page-header"
import NoticeBoard from "@/components/dashboard/notices/notice-board"
import { DbHint } from "@/components/dashboard/status"
import { useApi } from "@/hooks/use-api"
import { useRequireAuth } from "@/lib/auth-context"

export default function TeacherNoticesPage() {
  useRequireAuth(["teacher"])

  // The server narrows this to school-wide + staff + teacher notices.
  const query = useApi("/api/notices?limit=50")

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Teacher Portal"
        title="Notices"
        description="Staff circulars and school-wide announcements from the administration."
      />

      <NoticeBoard
        query={query}
        emptyTitle="No notices right now"
        emptyText="Staff circulars published by the admin office will appear here."
      />

      <div className="flex justify-end">
        <DbHint />
      </div>
    </div>
  )
}
