import React from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import StatCard from "../components/StatCard"
import ErrorDisplay from "../components/ErrorDisplay"
import { useReports } from "../hooks/useReports"
import { DateRangeFilter } from "../components/DateRangeFilter"

interface PerformanceData {
  totalSessions: number
  simStartedCount: number
  simCompletedCount: number
  successRate: number
  topErrors: { error: string; count: number }[]
  simAttemptsOverTime: { day: string; count: number }[]
}

const PerformanceReport = () => {
  const { dateRange, setDateRange, fetchPerformance } = useReports()
  const [data, setData] = React.useState<PerformanceData | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const loadData = React.useCallback(() => {
    setLoading(true)
    setError(null)
    fetchPerformance()
      .then((d) => {
        setData(d)
        setLoading(false)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load performance data")
        setLoading(false)
      })
  }, [fetchPerformance])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  if (loading) return <p>Loading...</p>
  if (error) return <ErrorDisplay message={error} onRetry={loadData} />
  if (!data) return <p>No data available.</p>

  return (
    <div>
      <DateRangeFilter value={dateRange} onChange={setDateRange} />
      <div style={styles.statsRow}>
        <StatCard title="Total Sessions" value={data.totalSessions} color="#0066cc" />
        <StatCard
          title="Success Rate"
          value={`${data.successRate}%`}
          subtitle={`${data.simCompletedCount} completed / ${data.simStartedCount} started`}
          color={data.successRate >= 70 ? "#27ae60" : "#e74c3c"}
        />
      </div>
      {data.topErrors.length > 0 && (
        <div style={styles.tableContainer}>
          <h3 style={styles.tableTitle}>Top Errors</h3>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Error</th>
                <th style={styles.th}>Count</th>
              </tr>
            </thead>
            <tbody>
              {data.topErrors.map((err, i) => (
                <tr key={i}>
                  <td style={styles.td}>{err.error}</td>
                  <td style={{ ...styles.td, textAlign: "center" }}>{err.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {data.simAttemptsOverTime.length > 0 && (
        <div style={styles.chartContainer}>
          <h3 style={styles.chartTitle}>Simulation Attempts (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.simAttemptsOverTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#e74c3c" name="Attempts" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  statsRow: {
    display: "flex",
    gap: 16,
    marginBottom: 24,
    flexWrap: "wrap",
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
}

export default PerformanceReport
