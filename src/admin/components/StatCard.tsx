import React from "react"

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  color?: string
}

const StatCard = React.memo(
  ({ title, value, subtitle, color = "#0066cc" }: StatCardProps) => {
    return (
      <div style={styles.card}>
        <div style={{ ...styles.accent, backgroundColor: color }} />
        <p style={styles.title}>{title}</p>
        <p style={styles.value}>{value}</p>
        {subtitle && <p style={styles.subtitle}>{subtitle}</p>}
      </div>
    )
  }
)

const styles: { [key: string]: React.CSSProperties } = {
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 20,
    position: "relative",
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
    minWidth: 180,
  },
  accent: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 4,
    height: "100%",
    borderRadius: "8px 0 0 8px",
  },
  title: {
    fontSize: 13,
    color: "#888",
    margin: "0 0 8px 12px",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 28,
    fontWeight: 700,
    color: "#333",
    margin: "0 0 4px 12px",
  },
  subtitle: {
    fontSize: 12,
    color: "#999",
    margin: "0 0 0 12px",
  },
}

export default StatCard
