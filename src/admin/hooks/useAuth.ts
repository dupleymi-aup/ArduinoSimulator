import React from "react"

export function useAuth() {
  const [token, setToken] = React.useState<string | null>(
    localStorage.getItem("arduino-sim-admin-token")
  )
  const [loginError, setLoginError] = React.useState<string | null>(null)

  const login = async (username: string, password: string): Promise<boolean> => {
    setLoginError(null)
    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL || "http://localhost:3001"}/api/admin/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        }
      )

      if (res.ok) {
        const data = await res.json()
        localStorage.setItem("arduino-sim-admin-token", data.token)
        setToken(data.token)
        return true
      }

      if (res.status === 401) {
        setLoginError("Invalid username or password")
        return false
      }

      setLoginError("Server error. Please try again later.")
      return false
    } catch {
      setLoginError("Network error. Check your connection and try again.")
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem("arduino-sim-admin-token")
    setToken(null)
    setLoginError(null)
    window.location.href = "/admin/login"
  }

  return { token, login, logout, loginError, isAuthenticated: !!token }
}
