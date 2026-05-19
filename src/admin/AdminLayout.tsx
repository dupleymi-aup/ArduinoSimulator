import React from "react"

const TABS = ["Activity", "Performance", "Progress", "Pin Usage"]

interface AdminLayoutProps {
  activeTab: string
  onTabChange: (_tab: string) => void
  onLogout: () => void
  children: React.ReactNode
}

const AdminLayout = ({
  activeTab,
  onTabChange,
  onLogout,
  children,
}: AdminLayoutProps) => {
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.logo}>Arduino Simulator Admin</h1>
        <button
          onClick={onLogout}
          style={styles.logoutBtn}
          aria-label="Logout of admin panel"
        >
          Logout
        </button>
      </header>
      <nav style={styles.nav} role="tablist" aria-label="Admin reports">
        {TABS.map((tab, _index) => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            aria-controls={`panel-${tab.toLowerCase().replace(/\s+/g, "-")}`}
            id={`tab-${tab.toLowerCase().replace(/\s+/g, "-")}`}
            onClick={() => onTabChange(tab)}
            style={{
              ...styles.tab,
              ...(activeTab === tab ? styles.tabActive : {}),
            }}
          >
            {tab}
          </button>
        ))}
      </nav>
      <main
        style={styles.main}
        role="tabpanel"
        aria-labelledby={`tab-${activeTab.toLowerCase().replace(/\s+/g, "-")}`}
        id={`panel-${activeTab.toLowerCase().replace(/\s+/g, "-")}`}
      >
        {children}
      </main>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f5f7fa",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 24px",
    backgroundColor: "#fff",
    borderBottom: "1px solid #e0e0e0",
  },
  logo: {
    fontSize: 18,
    fontWeight: 600,
    color: "#333",
    margin: 0,
  },
  logoutBtn: {
    padding: "6px 16px",
    backgroundColor: "#e74c3c",
    color: "#fff",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
    fontSize: 13,
  },
  nav: {
    display: "flex",
    gap: 4,
    padding: "0 24px",
    backgroundColor: "#fff",
    borderBottom: "1px solid #e0e0e0",
  },
  tab: {
    padding: "10px 20px",
    border: "none",
    backgroundColor: "transparent",
    cursor: "pointer",
    fontSize: 14,
    color: "#666",
    borderBottom: "2px solid transparent",
    transition: "all 0.2s",
  },
  tabActive: {
    color: "#0066cc",
    borderBottomColor: "#0066cc",
    fontWeight: 600,
  },
  main: {
    padding: 24,
  },
}

export default AdminLayout
