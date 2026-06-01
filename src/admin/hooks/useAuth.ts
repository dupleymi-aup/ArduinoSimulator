import React from "react"

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]))
    return payload.exp ? Date.now() >= payload.exp * 1000 : false
  } catch {
    return true
  }
}

function getTokenExpiry(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]))
    return payload.exp ? payload.exp * 1000 : null
  } catch {
    return null
  }
}

export function useAuth() {
  const [token, setToken] = React.useState<string | null>(
    localStorage.getItem("arduino-sim-admin-token")
  )
  const [loginError, setLoginError] = React.useState<string | null>(null)
  const [tokenExpiringSoon, setTokenExpiringSoon] = React.useState(false)
  const tokenRef = React.useRef(token)
  tokenRef.current = token

  const logoutRef = React.useRef<() => void>(() => {})
  const logout = React.useCallback(() => {
    localStorage.removeItem("arduino-sim-admin-token")
    setToken(null)
    setLoginError(null)
    setTokenExpiringSoon(false)
    window.location.href = "/admin/login"
  }, [])

  logoutRef.current = logout

  // Check token expiry on mount and when token changes
  React.useEffect(() => {
    const currentToken = tokenRef.current
    if (!currentToken) {
      setTokenExpiringSoon(false)
      return
    }

    if (isTokenExpired(currentToken)) {
      logoutRef.current()
      return
    }

    const expiryTime = getTokenExpiry(currentToken)
    if (expiryTime) {
      const timeUntilExpiry = expiryTime - Date.now()
      const warningThreshold = 2 * 60 * 1000 // 2 minutes

      if (timeUntilExpiry <= warningThreshold) {
        setTokenExpiringSoon(true)
      } else {
        setTokenExpiringSoon(false)
        const warningTimer = setTimeout(() => {
          setTokenExpiringSoon(true)
        }, timeUntilExpiry - warningThreshold)
        return () => clearTimeout(warningTimer)
      }
    }
  }, [token])

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

  return { token, login, logout, loginError, isAuthenticated: !!token, tokenExpiringSoon }
}
