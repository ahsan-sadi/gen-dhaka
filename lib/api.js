"use client"

/* Thin fetch client for the BAFWWA GEN DHAKA Express backend.
   - Base URL comes from NEXT_PUBLIC_API_URL (defaults to localhost:8000).
   - The JWT lives in localStorage; every authenticated call sends it as
     `Authorization: Bearer <token>`. */

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

const TOKEN_KEY = "bafwwa_token"
const USER_KEY = "bafwwa_user"

export class ApiError extends Error {
  constructor(message, status, payload) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.payload = payload
  }
}

/* ---- token + cached user (survives reloads for instant hydration) ---- */

export function getToken() {
  if (typeof window === "undefined") return null
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (typeof window === "undefined") return
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  if (typeof window === "undefined") return
  localStorage.removeItem(TOKEN_KEY)
}

export function getStoredUser() {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setStoredUser(user) {
  if (typeof window === "undefined") return
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
  else localStorage.removeItem(USER_KEY)
}

export function clearStoredUser() {
  if (typeof window === "undefined") return
  localStorage.removeItem(USER_KEY)
}

/* ---- request helper ---- */

export async function apiFetch(path, options = {}) {
  const {
    method = "GET",
    body,
    auth = true,
    token: explicitToken,
    headers = {},
  } = options

  const token = explicitToken ?? (auth ? getToken() : null)

  const finalHeaders = { ...headers }
  if (body !== undefined && !(body instanceof FormData)) {
    finalHeaders["Content-Type"] = "application/json"
  }
  if (token) finalHeaders.Authorization = `Bearer ${token}`

  let response
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers: finalHeaders,
      body:
        body !== undefined && !(body instanceof FormData)
          ? JSON.stringify(body)
          : body,
      cache: "no-store",
    })
  } catch {
    throw new ApiError(
      "Cannot reach the school server. Make sure the backend is running on " +
        API_BASE,
      0
    )
  }

  let payload = null
  try {
    payload = await response.json()
  } catch {
    payload = null
  }

  if (!response.ok) {
    const message =
      payload?.error ||
      payload?.message ||
      `Request failed (${response.status})`
    throw new ApiError(message, response.status, payload)
  }

  return payload
}

export const api = {
  get: (path, options) => apiFetch(path, { ...options, method: "GET" }),
  post: (path, body, options) =>
    apiFetch(path, { ...options, method: "POST", body }),
  put: (path, body, options) =>
    apiFetch(path, { ...options, method: "PUT", body }),
  patch: (path, body, options) =>
    apiFetch(path, { ...options, method: "PATCH", body }),
  del: (path, options) => apiFetch(path, { ...options, method: "DELETE" }),
}
