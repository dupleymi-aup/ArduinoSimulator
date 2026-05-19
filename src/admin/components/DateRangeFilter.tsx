import React from "react"

interface DateRangeFilterProps {
  value: { start: string; end: string }
  onChange: (range: { start: string; end: string }) => void
}

export const DateRangeFilter = ({ value, onChange }: DateRangeFilterProps) => {
  return (
    <div style={styles.container}>
      <label style={styles.label}>From:</label>
      <input
        type="date"
        value={value.start}
        onChange={(e) => onChange({ ...value, start: e.target.value })}
        style={styles.input}
      />
      <label style={styles.label}>To:</label>
      <input
        type="date"
        value={value.end}
        onChange={(e) => onChange({ ...value, end: e.target.value })}
        style={styles.input}
      />
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
    flexWrap: "wrap",
  },
  label: {
    fontSize: 13,
    color: "#666",
  },
  input: {
    padding: "4px 8px",
    fontSize: 13,
    border: "1px solid #ddd",
    borderRadius: 4,
  },
}
