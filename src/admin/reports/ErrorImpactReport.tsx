import React from "react"
import {
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
import { useReportData } from "../hooks/useReportData"
import { DateRangeFilter } from "../components/DateRangeFilter"
import { colors } from "../styles/colors"

const ErrorImpactReport = () => {
  const { dateRange, setDateRange, fetchErrorImpact } = useReports()
  const { data, loading, error, reload } = useReportData(fetchErrorImpact, [
    dateRange,
  ])

  if (loading) return <LoadingState />
  if (error) return <ErrorDisplay message={error} onRetry={reload} />
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
        <StatCard
          title="Total Errors"
          value={data.totalErrors}
          color={colors.error}
        />
        <StatCard
          title="Avg Errors/Session"
          value={data.avgErrorsPerSession}
          color={colors.warning}
        />
        <StatCard
          title="Toxic Errors"
          value={data.toxicErrors.filter((e) => e.abandonmentCount > 0).length}
          color={colors.errorDark}
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
                fill={colors.primary}
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
                stroke={colors.error}
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
                {data.toxicErrors.slice(0, 10).map((e, _index) => (
                  <tr key={e.errorType}>
                    <td key={`${e.errorType}-type`} style={styles.td}>
                      {e.errorType}
                    </td>
                    <td key={`${e.errorType}-total`} style={styles.td}>
                      {e.totalCount}
                    </td>
                    <td
                      key={`${e.errorType}-abandonment`}
                      style={{ ...styles.td, color: colors.error, fontWeight: 600 }}
                    >
                      {e.abandonmentCount}
                    </td>
                    <td key={`${e.errorType}-rate`} style={styles.td}>
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
    borderCollapse: "collapse",
    fontSize: 13,
  },
  th: {
    padding: "8px 12px",
    textAlign: "left",
    borderBottom: "2px solid #e0e0e0",
    fontWeight: 600,
    color: "#333",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "8px 12px",
    borderBottom: "1px solid #f0f0f0",
  },
}

export default ErrorImpactReport
