import React from "react"
import { useAuth } from "./hooks/useAuth"
import AdminLogin from "./AdminLogin"
import AdminDashboard from "./AdminDashboard"
import AdminErrorBoundary from "./AdminErrorBoundary"

const AdminApp = () => {
  const { isAuthenticated, logout } = useAuth()

  if (!isAuthenticated) {
    return <AdminLogin onLogin={() => {}} />
  }

  return (
    <AdminErrorBoundary>
      <AdminDashboard onLogout={logout} />
    </AdminErrorBoundary>
  )
}

export default AdminApp
