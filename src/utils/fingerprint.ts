export function generateStudentId(): string {
  let id = localStorage.getItem("arduino-sim-student-id")
  if (!id) {
    id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`
    localStorage.setItem("arduino-sim-student-id", id)
  }
  return id
}

export function getStudentId(): string | null {
  return localStorage.getItem("arduino-sim-student-id")
}
