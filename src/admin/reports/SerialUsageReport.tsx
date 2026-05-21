import React from "react"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import StatCard from "../components/StatCard"
import ErrorDisplay from "../components/ErrorDisplay"
import LoadingState from "../components/LoadingState"
import ExportButton from "../components/ExportButton"
import { useReports } from "../hooks/useReports"
import { DateRangeFilter } from "../components/DateRangeFilter"

interface SerialTypeEntry {
  type: string
  count: number
}

interface SerialOverTimeEntry {
  day: string
  output: number
  send: number
}

interface SketchSerialEntry {
  sketchName: string
  count: number
}

interface SerialUsageData {
  totalOutputs: number
  totalSends: number
  byType: SerialTypeEntry[]
  serialOverTime: SerialOverTimeEntry[]
  topSketchesBySerial: SketchSerialEntry[]
  avgSerialPerSession: number
  interactiveRatio: number
}

const SerialUsageReport = () => {
  const { dateRange, setDateRange, fetchSerialUsage } = useReports()
  const [data, setData] = React.useState<SerialUsageData | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const loadData = React.useCallback(() => {
    setLoading(true)
    setError(null)
    fetchSerialUsage()
      .then((d) => {
        setData(d)
        setLoading(false)
      })
      .catch((err) => {
        setError(
          err instanceof Error ? err.message : "Failed to load serial usage data"
        )
        setLoading(false)
      })
  }, [fetchSerialUsage])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  if (loading) return <LoadingState />
  if (error) return <ErrorDisplay message={error} onRetry={loadData} />
  if (!data) return <p>No data available.</p>

  return (
    <div>
      <div style={styles.headerRow}>
        <DateRangeFilter value={dateRange} onChange={setDateRange} />
        {data.byType.length > 0 && (
          <ExportButton data={data.byType} filename="serial-usage" />
        )}
      </div>
      <div style={styles.statsRow}>
        <StatCard
          title="Serial Outputs"
          value={data.totalOutputs}
          color="#0066cc"
        />
        <StatCard
          title="Serial Sends"
          value={data.totalSends}
          color="#27ae60"
        />
        <StatCard
          title="Avg Serial/Session"
          value={data.avgSerialPerSession}
          color="#8e44ad"
        />
        <StatCard
          title="Interactive Ratio"
          value={`${data.interactiveRatio}%`}
          color="#f39c12"
        />
      </div>

      {data.byType.length > 0 && (
        <div style={styles.chartContainer}>
          <h3 style={styles.chartTitle}>Serial Events by Type</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.byType}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#0066cc" name="Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {data.serialOverTime.length > 0 && (
        <div style={styles.chartContainer}>
          <h3 style={styles.chartTitle}>Serial Activity Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.serialOverTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="output"
                stroke="#0066cc"
                name="Output"
              />
              <Line
                type="monotone"
                dataKey="send"
                stroke="#27ae60"
                name="Send"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {data.topSketchesBySerial.length > 0 && (
        <div style={styles.tableContainer}>
          <h3 style={styles.tableTitle}>Top Sketches by Serial Activity</h3>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Sketch</th>
                <th style={styles.th}>Sessions with Serial</th>
              </tr>
            </thead>
            <tbody>
              {data.topSketchesBySerial.map((s) => (
                <SketchSerialRow
                  key={s.sketchName}
                  sketchName={s.sketchName}
                  count={s.count}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

const SketchSerialRow = ({
  sketchName,
  count,
}: {
  sketchName: string
  count: number
}) => (
  <tr>
    <td style={styles.td}>{sketchName}</td>
    <td style={{ ...styles.td, textAlign: "center" }}>{count}</td>
  </tr>
)

const styles: { [key: string]: React.CSSProperties } = {
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
}

export default SerialUsageReport
