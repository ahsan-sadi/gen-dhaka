import {
  StatsGridSkeleton,
  CardGridSkeleton,
  TableSkeleton,
} from "@/components/shared/skeletons"
import { Skeleton } from "@/components/ui/skeleton"

export default function StudentLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <StatsGridSkeleton count={4} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <CardGridSkeleton count={3} />
      </div>
      <TableSkeleton rows={4} cols={5} />
    </div>
  )
}
