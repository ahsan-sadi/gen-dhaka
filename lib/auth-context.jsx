"use client"

/* Auth layer for the BAFWWA GEN DHAKA school app.

   The Express backend issues a JWT on POST /api/auth/login; we keep the token
   plus a cached copy of the user in localStorage so dashboards hydrate
   instantly, then revalidate against GET /api/auth/me on every mount. */

import { useRouter } from "next/navigation"
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import {
  api,
  clearStoredUser,
  clearToken,
  getStoredUser,
  getToken,
  setStoredUser,
  setToken,
} from "./api"

/* Module-level subscription so every useAuth() consumer stays in sync. */
let listeners = new Set()
let snapshot = { user: null, hydrated: false }

function emit(next) {
  snapshot = next
  listeners.forEach((listener) => listener())
}

function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

let revalidating = null

async function revalidate() {
  if (revalidating) return revalidating
  revalidating = (async () => {
    try {
      const user = await api.get("/api/auth/me")
      setStoredUser(user)
      emit({ user, hydrated: true })
    } catch {
      clearToken()
      clearStoredUser()
      emit({ user: null, hydrated: true })
    } finally {
      revalidating = null
    }
  })()
  return revalidating
}

export function useAuth() {
  /* SSR and the first client render are both anonymous — the cached session is
     applied inside an effect, so server HTML and hydration always match. */
  const [state, setState] = useState({ user: null, hydrated: false })
  const bootstrapped = useRef(false)

  useEffect(() => {
    const unsubscribe = subscribe(() => setState(snapshot))

    if (!bootstrapped.current) {
      bootstrapped.current = true
      emit({ user: getStoredUser(), hydrated: true })
      if (getToken()) revalidate()
    } else {
      setState(snapshot)
    }
    return unsubscribe
  }, [])

  const signIn = useCallback(async ({ email, password }) => {
    try {
      const result = await api.post(
        "/api/auth/login",
        { email, password },
        { auth: false }
      )
      setToken(result.token)
      setStoredUser(result.user)
      emit({ user: result.user, hydrated: true })
      return { ok: true, user: result.user }
    } catch (error) {
      return { ok: false, error: error.message }
    }
  }, [])

  const signOut = useCallback(async () => {
    clearToken()
    clearStoredUser()
    emit({ user: null, hydrated: true })
    return { ok: true }
  }, [])

  const refreshUser = useCallback(() => revalidate(), [])

  const user = state.user

  return useMemo(
    () => ({
      user,
      token: typeof window === "undefined" ? null : getToken(),
      hydrated: state.hydrated,
      isAuthenticated: Boolean(user),
      role: user?.role || null,
      signIn,
      signOut,
      refreshUser,
    }),
    [state.user, state.hydrated, signIn, signOut, refreshUser]
  )
}

/* Client-side route guard used by the dashboard layout. */
export function useRequireAuth(allowedRoles = null) {
  const { user, hydrated } = useAuth()
  const router = useRouter()

  const denied =
    hydrated && (!user || (allowedRoles && !allowedRoles.includes(user.role)))

  useEffect(() => {
    if (!hydrated) return
    if (!user) {
      router.replace("/sign-in")
    } else if (allowedRoles && !allowedRoles.includes(user.role)) {
      router.replace(dashboardHome(user.role))
    }
  }, [hydrated, user, router, allowedRoles])

  return {
    user,
    ready:
      hydrated &&
      Boolean(user) &&
      (!allowedRoles || allowedRoles.includes(user.role)),
    denied,
  }
}

export function dashboardHome(role) {
  if (role === "principal") return "/dashboard/principal"
  if (role === "admin") return "/dashboard/admin"
  if (role === "teacher") return "/dashboard/teacher"
  return "/dashboard/student"
}
