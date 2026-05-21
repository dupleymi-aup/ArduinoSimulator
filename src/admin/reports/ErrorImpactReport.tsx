import React from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  ResponsiveContainer,
  Legend,
  ScatterChart,
  Scatter,
} from "recharts"
import StatCard from "../components/StatCard"
import ErrorDisplay from "../components/ErrorDisplay"
import LoadingState from "../components/LoadingState"
import ExportButton from "../components/ExportButton"
import { useReports } from "../hooks/useReports"
import { DateRangeFilter } from "../components/DateRangeFilter"

interface ErrorImpactData {
  errorVsSuccess: { errors: number; completionRate: number }[]
  toxicErrors: { errorType: string; abandonmentCount: number; totalCount: number }[]
  errorTrendByDay: { day: string; count: number }[]
  totalErrors: number
  avgErrorsPerSession: number
}

const ErrorImpactReport = () => {
  const { dateRange, setDateRange, fetchErrorImpact } = useReports()
  const [data, setData] = React.useState<ErrorImpactData | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const loadData = React.useCallback(() => {
    setLoading(true)
    setError(null)
    fetchErrorImpact()
      .then((d) => {
        setData(d as ErrorImpactData | null)
        setLoading(false)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load error impact data")
        setLoading(false)
      })
  }, [fetchErrorImpact])

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
        {data.toxicErrors.length > 0 && (
          <ExportButton data={data.toxicErrors} filename="error-impact" />
        )}
      </div>
      <div style={styles.statsRow}>
        <StatCard title="Total Errors" value={data.totalErrors} color="#e74c3c" />
        <StatCard
          title="Avg Errors/Session"
          value={data.avgErrorsPerSession}
          color="#f39c12"
        />
        <StatCard
          title="Toxic Errors"
          value={data.toxicErrors.filter((e) => e.abandonmentCount > 0).length}
          color="#c0392b"
        />
      </div>

      {data.errorVsSuccess.length > 0 && (
        <div style={styles.chartContainer}>
          <h3 style={styles.chartTitle}>Errors vs Completion Rate</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="errors" name="Errors" />
              <YAxis dataKey="completionRate" name="Completion Rate (%)" />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} />
              <Legend />
              <Scatter
                name="Completion Rate"
                data={data.errorVsSuccess}
                fill="#0066cc"
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      )}

      {data.errorTrendByDay.length > 0 && (
        <div style={styles.chartContainer}>
          <h3 style={styles.chartTitle}>Error Trend Over Time</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data.errorTrendByDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#e74c3c"
                name="Errors"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {data.toxicErrors.length > 0 && (
        <div style={styles.chartContainer}>
          <h3 style={styles.chartTitle}>Toxic Errors (Causing Abandonment)</h3>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Error Type</th>
                  <th style={styles.th}>Total Occurrences</th>
                  <th style={styles.th}>Abandonments</th>
                  <th style={styles.th}>Abandonment Rate</th>
                </tr>
              </thead>
              <tbody>
                {data.toxicErrors.slice(0, 10).map((e, i) => (
                  <tr key={i}>
                    <td style={styles.td}>{e.errorType}</td>
                    <td style={styles.td}>{e.totalCount}</td>
                    <td style={{ ...styles.td, color: "#e74c3c", fontWeight: 600 }}>
                      {e.abandonmentCount}
                    </td>
                    <td style={styles.td}>
                      {e.totalCount > 0
                        ? Math.round((e.abandonmentCount / e.totalCount) * 100)
                        : 0}
                      %
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
  tableWrapper: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    fontSize: 13,
  },
  th: {
    padding: "8px 12px",
    textAlign: "left" as const,
    borderBottom: "2px solid #e0e0e0",
    fontWeight: 600,
    color: "#333",
    whiteSpace: "nowrap" as const,
  },
  td: {
    padding: "8px 12px",
    borderBottom: "1px solid #f0f0f0",
  },
}

export default ErrorImpactReport
