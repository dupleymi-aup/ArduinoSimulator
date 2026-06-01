const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:3001"

export class ApiError extends Error {
  public status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

export async function apiFetch<T = unknown>(
  path: string,
  options: Parameters<typeof fetch>[1] = {}
): Promise<T | null> {
  const token = localStorage.getItem("arduino-sim-admin-token")

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }

  if (options.headers) {
    const incoming = options.headers as Record<string, string>
    for (const [key, value] of Object.entries(incoming)) {
      headers[key] = value
    }
  }

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

    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as { error?: string } | null
      throw new ApiError(
        body?.error || `Request failed with status ${res.status}`,
        res.status
      )
    }

    if (res.status === 204) return null
    return (await res.json()) as T
  } catch (err) {
    if (err instanceof ApiError) throw err
    throw new ApiError(
      err instanceof Error ? err.message : "Network request failed",
      0
    )
  }
}
