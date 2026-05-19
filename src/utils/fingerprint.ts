function generateId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function generateStudentId(): string {
  try {
    let id = localStorage.getItem("arduino-sim-student-id")
    if (!id) {
      id = generateId()
      localStorage.setItem("arduino-sim-student-id", id)
    }
    return id
  } catch {
    // localStorage unavailable (private browsing, disabled); return ephemeral ID
    return generateId()
  }
}

export function getStudentId(): string | null {
  try {
    return localStorage.getItem("arduino-sim-student-id")
  } catch {
    return null
  }
}
