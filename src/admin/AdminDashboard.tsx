import React from "react"
import AdminLayout from "./AdminLayout"
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts"
import { useAuth } from "./hooks/useAuth"
import { TAB_MAP, TAB_NAMES } from "./config/tabs"

const styles: { [key: string]: React.CSSProperties } = {
  tokenWarning: {
    backgroundColor: "#fef3c7",
    border: "1px solid #f59e0b",
    color: "#92400e",
    padding: "10px 16px",
    borderRadius: "4px",
    margin: "12px 16px",
    fontSize: "14px",
    textAlign: "center",
  },
}

const AdminDashboard = ({ onLogout }: { onLogout: () => void }) => {
  const { tokenExpiringSoon } = useAuth()
  const [activeTab, setActiveTab] = React.useState("Activity")
  const ReportComponent = TAB_MAP[activeTab] || ActivityReport
  const { HelpModal } = useKeyboardShortcuts({
    tabNames: TAB_NAMES,
    onTabChange: setActiveTab,
    onLogout,
  })

  return (
    <AdminLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onLogout={onLogout}
    >
      {tokenExpiringSoon && (
        <div style={styles.tokenWarning}>
          Your session will expire soon. Please save your work and log in again if needed.
        </div>
      )}
      <React.Suspense fallback={<div style={{ padding: "2rem", textAlign: "center" }}>Loading report...</div>}>
        <ReportComponent />
      </React.Suspense>
      {HelpModal && <HelpModal />}
    </AdminLayout>
  )
}

export default AdminDashboard
