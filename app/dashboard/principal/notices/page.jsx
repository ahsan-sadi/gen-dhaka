"use client"

import PageHeader from "@/components/shared/page-header"
import NoticeBoard from "@/components/dashboard/notices/notice-board"
import { DbHint } from "@/components/dashboard/status"
import { useApi } from "@/hooks/use-api"
import { useRequireAuth } from "@/lib/auth-context"

export default function PrincipalNoticesPage() {
  useRequireAuth(["principal"])

  // The server returns exactly what the principal may see (everything).
  const query = useApi("/api/notices?limit=50")

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Office of the Principal"
        title="Notices"
        description="School-wide announcements as published by the administration — the same board the staff and students read."
      />

      <NoticeBoard
        query={query}
        emptyTitle="No notices on the board"
        emptyText="Notices published from the Admin dashboard will appear here for the Principal's review."
      />

      <div className="flex justify-end">
        <DbHint />
      </div>
    </div>
  )
}
