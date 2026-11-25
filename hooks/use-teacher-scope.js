"use client"

import { useCallback, useEffect, useState } from "react"
import { api } from "@/lib/api"
import { docId, toList } from "@/lib/utils"

/**
 * Everything a teacher sees: the classes where they are class teacher plus
 * every student enrolled in them.
 *
 * Loads `/api/classes` once, then one `/api/students?classId=` request per
 * assigned class (≤100 each — a class never exceeds its capacity), so counts
 * and rosters always agree.
 */
export function useTeacherScope(user) {
  const teacherId = docId(user)
  const [classes, setClasses] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    if (!teacherId) return
    setLoading(true)
    setError(null)
    try {
      const all = toList(await api.get("/api/classes"), "classes")
      const mine = all.filter(
        (klass) =>
          klass.classTeacherId &&
          String(klass.classTeacherId) === String(teacherId),
      )
      const rosters = await Promise.all(
        mine.map((klass) =>
          api
            .get(`/api/students?classId=${klass.id}&limit=100`)
            .catch(() => ({ items: [] })),
        ),
      )
      setClasses(mine)
      setStudents(rosters.flatMap((list) => toList(list, "students")))
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [teacherId])

  useEffect(() => {
    load()
  }, [load])

  /** How many enrolled students a single class has. */
  const countFor = useCallback(
    (classId) =>
      students.filter((student) => String(student.classId) === String(classId))
        .length,
    [students],
  )

  return { classes, students, countFor, loading, error, refetch: load }
}

export default useTeacherScope
