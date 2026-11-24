import { StatsGridSkeleton, CardSkeleton } from "@/components/shared/skeletons"
import { Skeleton } from "@/components/ui/skeleton"

/* Fallback shown while /dashboard/teacher (and its child routes) resolve. */
export default function TeacherLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-9 w-72" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <StatsGridSkeleton count={4} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  )
}
