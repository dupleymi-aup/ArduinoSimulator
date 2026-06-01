import React from "react"

/**
 * Shared styles for all admin report components.
 * Eliminates ~500 lines of duplicated style definitions.
 */
export const reportStyles: { [key: string]: React.CSSProperties } = {
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: 12,
  },
  statsRow: {
    display: "flex",
    gap: 16,
    marginBottom: 24,
    flexWrap: "wrap",
  },
  chartContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 20,
    marginBottom: 16,
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
  },
  chartTitle: {
    margin: "0 0 16px",
    fontSize: 16,
    color: "#333",
  },
  tableContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 20,
    marginBottom: 16,
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
  },
  tableTitle: {
    margin: "0 0 16px",
    fontSize: 16,
    color: "#333",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 14,
  },
  th: {
    textAlign: "left",
    padding: "8px 12px",
    borderBottom: "2px solid #e0e0e0",
    color: "#666",
    fontWeight: 600,
  },
  td: {
    padding: "8px 12px",
    borderBottom: "1px solid #f0f0f0",
  },
  clickableRow: {
    cursor: "pointer",
    transition: "background-color 0.15s",
  },
  detailPanel: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 20,
    marginTop: 16,
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
    border: "2px solid #0066cc",
  },
  detailTitle: {
    margin: "0 0 16px",
    fontSize: 16,
    color: "#333",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: 22,
    cursor: "pointer",
    color: "#666",
    lineHeight: 1,
  },
}
