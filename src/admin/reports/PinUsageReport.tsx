import React from "react"
import StatCard from "../components/StatCard"
import ErrorDisplay from "../components/ErrorDisplay"
import LoadingState from "../components/LoadingState"
import ExportButton from "../components/ExportButton"
import { useReports } from "../hooks/useReports"
import { useReportData } from "../hooks/useReportData"

const DIGITAL_PIN_COUNT = 54
const ANALOG_PIN_COUNT = 16
const DIGITAL_PINS = (() => {
  const arr: number[] = []
  for (let i = 0; i < DIGITAL_PIN_COUNT; i++) arr.push(i)
  return arr
})()
const ANALOG_PINS = (() => {
  const arr: number[] = []
  for (let i = 0; i < ANALOG_PIN_COUNT; i++) arr.push(i)
  return arr
})()

const PinUsageReport = () => {
  const { fetchPinUsage } = useReports()
  const { data, loading, error, reload } = useReportData(fetchPinUsage)

  if (loading) return <LoadingState />
  if (error) return <ErrorDisplay message={error} onRetry={reload} />
  if (!data) return <p>No data available.</p>

  const maxDigital = Math.max(
    1,
    ...(Object.values(data.digitalPins || {}) as number[])
  )
  const maxAnalog = Math.max(
    1,
    ...(Object.values(data.analogPins || {}) as number[])
  )

  const getHeatColor = (value: number, max: number) => {
    const intensity = value / max
    const r = Math.round(255 * intensity)
    const g = Math.round(200 * (1 - intensity))
    return `rgb(${r}, ${g}, 100)`
  }

  const totalDigitalUsage = Object.values(data.digitalPins || {}).reduce(
    (s: number, v: number) => s + v,
    0
  )
  const totalAnalogUsage = Object.values(data.analogPins || {}).reduce(
    (s: number, v: number) => s + v,
    0
  )

  const pinData = [
    { type: "Digital", total: totalDigitalUsage },
    { type: "Analog", total: totalAnalogUsage },
  ]

  return (
    <div>
      <div style={styles.headerRow}>
        <h2 style={styles.pageTitle}>Pin Usage Report</h2>
        <ExportButton data={pinData} filename="pin-usage" />
      </div>
      <div style={styles.statsRow}>
        <StatCard
          title="Digital Pin Events"
          value={totalDigitalUsage as number}
          color="#0066cc"
        />
        <StatCard
          title="Analog Pin Events"
          value={totalAnalogUsage as number}
          color="#f39c12"
        />
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Digital Pins (0-53)</h3>
        <div style={styles.pinGrid}>
          {DIGITAL_PINS.map((i, _index) => {
            const count = data.digitalPins[i] || 0
            return (
              <div
                key={i}
                style={{
                  ...styles.pinCell,
                  backgroundColor:
                    count > 0 ? getHeatColor(count, maxDigital) : "#eee",
                }}
                title={`Pin ${i}: ${count} events`}
              >
                {i}
                {count > 0 && <span style={styles.pinCount}>{count}</span>}
              </div>
            )
          })}
        </div>
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Analog Pins (A0-A15)</h3>
        <div style={styles.pinGrid}>
          {ANALOG_PINS.map((i, _index) => {
            const count = data.analogPins[i] || 0
            return (
              <div
                key={i}
                style={{
                  ...styles.pinCell,
                  backgroundColor:
                    count > 0 ? getHeatColor(count, maxAnalog) : "#eee",
                }}
                title={`Pin A${i}: ${count} events`}
              >
                A{i}
                {count > 0 && <span style={styles.pinCount}>{count}</span>}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    flexWrap: "wrap",
    gap: 12,
  },
  pageTitle: {
    margin: 0,
    fontSize: 20,
    fontWeight: 600,
    color: "#333",
  },
  statsRow: {
    display: "flex",
    gap: 16,
    marginBottom: 24,
    flexWrap: "wrap",
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 20,
    marginBottom: 16,
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
  },
  sectionTitle: {
    margin: "0 0 16px",
    fontSize: 16,
    color: "#333",
  },
  pinGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(60px, 1fr))",
    gap: 4,
  },
  pinCell: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "8px 4px",
    borderRadius: 4,
    fontSize: 13,
    color: "#333",
    minHeight: 40,
  },
  pinCount: {
    fontSize: 11,
    fontWeight: 600,
    color: "#fff",
    textShadow: "0 1px 2px rgba(0,0,0,0.3)",
  },
}

export default PinUsageReport
