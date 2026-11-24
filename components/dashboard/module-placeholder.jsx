"use client"

import Link from "next/link"
import {
  ArrowRight,
  BookOpen,
  BarChart3,
  CalendarRange,
  ClipboardCheck,
  Construction,
  GraduationCap,
  MessageSquare,
  Users,
  UsersRound,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import PageHeader from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"

/* Server pages pass a plain string across the RSC boundary — icons are
   resolved here, inside the client tree (functions can't cross it). */
const ICONS = {
  construction: Construction,
  users: Users,
  usersRound: UsersRound,
  calendarRange: CalendarRange,
  gradCap: GraduationCap,
  message: MessageSquare,
  book: BookOpen,
  clipboard: ClipboardCheck,
  chart: BarChart3,
}

/**
 * Sidebar-complete shell: every module has a real route from day one, and
 * each build step replaces the placeholder with the finished screen.
 */
export function ModulePlaceholder({
  eyebrow,
  title,
  description,
  iconName = "construction",
  moduleTitle,
  moduleText,
  actionLabel = "Back to overview",
  actionHref,
}) {
  const Icon = ICONS[iconName] || Construction

  return (
    <div className="space-y-6">
      <PageHeader eyebrow={eyebrow} title={title} description={description} />

      <div className="rounded-2xl border border-dashed border-border bg-card p-6">
        <EmptyState
          icon={Icon}
          title={moduleTitle}
          description={moduleText}
          actionLabel={actionLabel}
          actionHref={actionHref}
        />
        <p className="mt-4 text-center text-xs text-muted-foreground">
          This module is being built step by step — each step is added by the
          school administration flow.
        </p>
      </div>

      <div className="flex justify-center">
        <Button variant="ghost" size="sm" render={<Link href={actionHref} />}>
          {actionLabel} <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}

export default ModulePlaceholder
