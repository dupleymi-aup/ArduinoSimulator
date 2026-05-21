import React from "react"

interface ExportButtonProps {
  data: Record<string, unknown>[] | Record<string, unknown>
  filename: string
}

const ExportButton = ({ data, filename }: ExportButtonProps) => {
  const exportToCsv = () => {
    const items = Array.isArray(data) ? data : [data]
    if (items.length === 0) return

    const headers = Object.keys(items[0])
    const csvRows = [
      headers.join(","),
      ...items.map((row) =>
        headers.map((h) => {
          const val = row[h]
          const str = val === null || val === undefined ? "" : String(val)
          return str.includes(",") || str.includes('"') || str.includes("\n")
            ? `"${str.replace(/"/g, '""')}"`
            : str
        }).join(",")
      ),
    ]

    download(csvRows.join("\n"), `${filename}.csv`, "text/csv")
  }

  const exportToJson = () => {
    const json = Array.isArray(data) ? data : [data]
    download(JSON.stringify(json, null, 2), `${filename}.json`, "application/json")
  }

  const download = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={styles.container}>
      <button onClick={exportToCsv} style={styles.button} aria-label="Export as CSV">
        CSV
      </button>
      <button onClick={exportToJson} style={styles.button} aria-label="Export as JSON">
        JSON
      </button>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex",
    gap: 8,
  },
  button: {
    padding: "6px 12px",
    backgroundColor: "#fff",
    border: "1px solid #ccc",
    borderRadius: 4,
    cursor: "pointer",
    fontSize: 12,
    color: "#333",
    transition: "all 0.2s",
  },
}

export default ExportButton
