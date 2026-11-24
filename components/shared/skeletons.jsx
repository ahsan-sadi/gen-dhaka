import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <Skeleton className="h-44 w-full rounded-none" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-4/5" />
        <div className="flex gap-3 pt-1">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-7 w-full rounded-lg" />
        <Skeleton className="h-9 w-full" />
      </div>
    </div>
  )
}

export function CardGridSkeleton({ count = 6 }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}

export function StatCardSkeleton() {
  return (
    <Card className="rounded-2xl">
      <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="size-9 rounded-lg" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  )
}

export function StatsGridSkeleton({ count = 4 }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function TableSkeleton({ rows = 6, cols = 5 }) {
  return (
    <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
      <Skeleton className="h-6 w-44" />
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          className="flex items-center gap-4 border-t border-border pt-3"
        >
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton
              key={c}
              className={c === 0 ? "h-4 w-40" : "h-4 max-w-32 flex-1"}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export function PageSkeleton() {
  return (
    <div className="container-page space-y-6 py-12">
      <Skeleton className="h-9 w-72" />
      <Skeleton className="h-4 w-96 max-w-full" />
      <CardGridSkeleton count={6} />
    </div>
  )
}
