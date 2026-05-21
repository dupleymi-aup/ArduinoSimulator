import React from "react"
import StudentFilter from "./StudentFilter"

interface FilterState {
  dateRange: { start: string; end: string }
  studentId: string
  sketchName: string
  boardType: string
}

interface DateRangeFilterProps {
  value: { start: string; end: string }
  onChange: (_range: { start: string; end: string }) => void
  filters?: FilterState
  onFilterChange?: (_filters: FilterState) => void
}

export const DateRangeFilter = ({ value, onChange, filters, onFilterChange }: DateRangeFilterProps) => {
  const showFilters = filters && onFilterChange

  return (
    <div style={styles.container}>
      <div style={styles.row}>
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
      {showFilters && (
        <div style={styles.row}>
          <StudentFilter
            value={filters.studentId}
            onChange={(studentId) => onFilterChange({ ...filters, studentId })}
          />
          <select
            value={filters.sketchName}
            onChange={(e) => onFilterChange({ ...filters, sketchName: e.target.value })}
            style={styles.select}
            aria-label="Filter by sketch"
          >
            <option value="">All sketches</option>
            <option value="blink">Blink</option>
            <option value="button">Button</option>
            <option value="fade">Fade</option>
            <option value="analog_read">Analog Read</option>
            <option value="servo">Servo</option>
            <option value="led_control">LED Control</option>
          </select>
          <select
            value={filters.boardType}
            onChange={(e) => onFilterChange({ ...filters, boardType: e.target.value })}
            style={styles.select}
            aria-label="Filter by board type"
          >
            <option value="">All boards</option>
            <option value="uno">Arduino Uno</option>
            <option value="mega">Arduino Mega</option>
            <option value="nano">Arduino Nano</option>
            <option value="leonardo">Arduino Leonardo</option>
          </select>
        </div>
      )}
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    marginBottom: 20,
    flexWrap: "wrap",
  },
  row: {
    display: "flex",
    alignItems: "center",
    gap: 8,
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
  select: {
    padding: "6px 12px",
    border: "1px solid #ccc",
    borderRadius: 4,
    fontSize: 13,
    backgroundColor: "#fff",
    minWidth: 150,
  },
}
