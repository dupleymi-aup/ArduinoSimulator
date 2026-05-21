import React from "react"
import {
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
import { useReportData } from "../hooks/useReportData"
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
  const { data, loading, error, reload } = useReportData(fetchPerformance, [dateRange])

  if (loading) return <LoadingState />
  if (error) return <ErrorDisplay message={error} onRetry={reload} />
  if (!data) return <p>No data available.</p>

  return (
    <div>
      <div style={styles.headerRow}>
        <DateRangeFilter value={dateRange} onChange={setDateRange} />
        {data.topErrors.length > 0 && (
          <ExportButton data={data.topErrors} filename="performance-errors" />
        )}
      </div>
      <div style={styles.statsRow}>
        <StatCard
          title="Total Sessions"
          value={data.totalSessions}
          color="#0066cc"
        />
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
              {data.topErrors.map((err, _i) => (
                <ErrorRow key={err.error} error={err.error} count={err.count} />
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
              <Legend />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#e74c3c"
                name="Attempts"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

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

const ErrorRow = ({ error, count }: { error: string; count: number }) => (
  <tr>
    <td style={styles.td}>{error}</td>
    <td style={{ ...styles.td, textAlign: "center" }}>{count}</td>
  </tr>
)

export default PerformanceReport
