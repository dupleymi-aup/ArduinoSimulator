import React, { useEffect, useState } from "react"
import { apiFetch } from "../utils/api"

interface Student {
  id: string
  identifier: string
  sessionCount: number
}

interface StudentFilterProps {
  value: string
  onChange: (studentId: string) => void
}

const StudentFilter = ({ value, onChange }: StudentFilterProps) => {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    apiFetch<Student[]>("/api/admin/students")
      .then((data) => {
        if (!cancelled && data) setStudents(data)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  if (loading) {
    return (
      <select disabled style={styles.select}>
        <option>Loading students...</option>
      </select>
    )
  }

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={styles.select}
      aria-label="Filter by student"
    >
      <option value="">All students</option>
      {students.map((s) => (
        <option key={s.id} value={s.id}>
          {s.identifier} ({s.sessionCount} sessions)
        </option>
      ))}
    </select>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  select: {
    padding: "6px 12px",
    border: "1px solid #ccc",
    borderRadius: 4,
    fontSize: 13,
    backgroundColor: "#fff",
    minWidth: 180,
  },
}

export default StudentFilter
