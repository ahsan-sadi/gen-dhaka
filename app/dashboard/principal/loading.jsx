import { StatsGridSkeleton, TableSkeleton } from "@/components/shared/skeletons"
import { Skeleton } from "@/components/ui/skeleton"

/* Fallback shown while /dashboard/principal (and its child routes) resolve. */
export default function PrincipalLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-9 w-72" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <StatsGridSkeleton count={4} />
      <div className="grid gap-6 lg:grid-cols-2">
        <TableSkeleton rows={4} cols={3} />
        <TableSkeleton rows={4} cols={3} />
      </div>
    </div>
  )
}
