const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:3001"

export async function apiFetch<T = unknown>(
  path: string,
  options: Parameters<typeof fetch>[1] = {}
): Promise<T | null> {
  const token = localStorage.getItem("arduino-sim-admin-token")

  // Auth header always takes precedence
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }

  // Merge incoming headers from options
  if (options.headers) {
    const incoming = options.headers as Record<string, string>
    for (const [key, value] of Object.entries(incoming)) {
      headers[key] = value
    }
  }

  // Add auth token if available
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  try {
    const res = await fetch(`${BACKEND_URL}${path}`, { ...options, headers })

    if (res.status === 401) {
      localStorage.removeItem("arduino-sim-admin-token")
      window.location.href = "/admin/login"
      return null
    }

    if (res.status === 204) return null
    return (await res.json()) as T
  } catch {
    // Network or parsing errors are silently handled; caller receives null.
    return null
  }
}
