"use client"

import { AlertTriangle, Database, Loader2 } from "lucide-react"

/* Inline status surfaces for dashboard pages that read the school API. */

export function BackendAlert({ error }) {
  if (!error) return null
  const notConfigured = error.status === 503 || error.status === 0

  return (
    <div
      className="flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200"
      role="alert"
    >
      <AlertTriangle className="mt-0.5 size-4 shrink-0" />
      <div>
        <p className="font-semibold">
          {notConfigured
            ? "School server not reachable"
            : "Could not load this data"}
        </p>
        <p className="mt-1 leading-relaxed">
          {error.message}
          {notConfigured && (
            <>
              {" "}
              Start it with <code className="font-medium">npm start</code> in{" "}
              <code className="font-medium">backend-gen-dhaka</code>, make sure{" "}
              <code className="font-medium">MONGO_URI</code> is set in{" "}
              <code className="font-medium">backend-gen-dhaka/.env</code>, then
              run <code className="font-medium">npm run seed</code>.
            </>
          )}
        </p>
      </div>
    </div>
  )
}

export function LoadingRow({ label = "Loading…" }) {
  return (
    <p className="flex items-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="size-4 animate-spin" /> {label}
    </p>
  )
}

export function DbHint() {
  return (
    <p className="flex items-center gap-2 text-xs text-muted-foreground">
      <Database className="size-3.5" /> Live from the BAFWWA school database
    </p>
  )
}

export default BackendAlert
