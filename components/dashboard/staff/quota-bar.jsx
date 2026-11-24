import { cn } from "@/lib/utils"

/* Same palette as StatCard so quota cards stay on-system. */
export const QUOTA_TONES = {
  primary:
    "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300",
  violet:
    "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300",
  emerald:
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300",
  amber:
    "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300",
  rose: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300",
  sky: "bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300",
}

/**
 * Filled-slots bar for one staff quota (1 / 8 / 65 / 50).
 * Amber once the school's fixed head-count is reached.
 */
export function QuotaBar({ used, limit }) {
  const pct = limit ? Math.min(100, Math.round((used / limit) * 100)) : 0
  const full = used >= limit

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground">
        <span>
          {used} of {limit} filled
        </span>
        <span className={full ? "text-amber-600 dark:text-amber-400" : ""}>
          {full ? "Quota full" : `${limit - used} free`}
        </span>
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            full ? "bg-amber-500" : "bg-primary",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export default QuotaBar
