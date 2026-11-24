"use client"

/* Tiny GET-data hook for the school API.

   useApi("/api/staff?role=teacher") → { data, error, loading, refetch }
   Always re-fetches when `path` changes; `enabled: false` pauses it. */

import { useCallback, useEffect, useRef, useState } from "react"
import { api } from "@/lib/api"

export function useApi(path, options = {}) {
  const { enabled = true } = options
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(Boolean(enabled && path))
  const controllerRef = useRef(null)

  const fetchNow = useCallback(async () => {
    if (!enabled || !path) {
      setLoading(false)
      return
    }
    controllerRef.current?.abort?.()
    setLoading(true)
    setError(null)
    try {
      const result = await api.get(path)
      setData(result)
    } catch (err) {
      if (err?.name !== "AbortError") setError(err)
    } finally {
      setLoading(false)
    }
  }, [enabled, path])

  useEffect(() => {
    fetchNow()
    return () => controllerRef.current?.abort?.()
  }, [fetchNow])

  return { data, error, loading, refetch: fetchNow }
}

export default useApi
