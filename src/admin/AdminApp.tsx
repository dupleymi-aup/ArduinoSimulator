import React from "react"
import { useAuth } from "./hooks/useAuth"
import AdminLogin from "./AdminLogin"
import AdminDashboard from "./AdminDashboard"

const AdminApp = () => {
  const { isAuthenticated, logout } = useAuth()
  const [, forceUpdate] = React.useState(0)

  const handleLogin = () => {
    forceUpdate((n) => n + 1)
  }

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />
  }

  return <AdminDashboard onLogout={logout} />
}

export default AdminApp
