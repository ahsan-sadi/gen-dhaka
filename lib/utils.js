export { cn } from "cn"

/* Consistent avatar for every person in the school — falls back to a
   deterministic Dicebear initials avatar (no local image assets needed). */
export function avatarUrl(person) {
  if (!person) return "https://api.dicebear.com/9.x/initials/svg?seed=BAFWWA"
  if (person.image) return person.image
  const seed = encodeURIComponent(person.name || person.email || "BAFWWA")
  return `https://api.dicebear.com/9.x/initials/svg?seed=${seed}&backgroundColor=c7d2fe,d8b4fe,fbcfe8&textColor=1e1b4b`
}

export const shortId = (value) =>
  value ? String(value).slice(-6).toUpperCase() : "—"

/* Mongo may hand back `_id`, the API may hand back `id` — never care. */
export const docId = (doc) => doc?.id ?? doc?._id ?? null

/* List endpoints may return a bare array or an envelope ({ items, sessions,
   classes, students …}). Normalise either shape. */
export function toList(data, ...keys) {
  if (Array.isArray(data)) return data
  if (!data || typeof data !== "object") return []
  for (const key of [...keys, "items", "documents", "results", "data"]) {
    if (Array.isArray(data[key])) return data[key]
  }
  return []
}
