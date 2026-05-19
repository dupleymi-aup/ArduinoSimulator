const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:3001"

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("arduino-sim-admin-token")
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const res = await fetch(`${BACKEND_URL}${path}`, { ...options, headers })

  if (res.status === 401) {
    localStorage.removeItem("arduino-sim-admin-token")
    window.location.href = "/admin/login"
    return null
  }

  if (res.status === 204) return null
  return res.json()
}
