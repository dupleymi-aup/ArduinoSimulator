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
import { useReportData } from "../hooks/useReportData"
import { DateRangeFilter } from "../components/DateRangeFilter"

interface EndReasonEntry {
  reason: string
  count: number
}

interface TrendEntry {
  day: string
  user_stop: number
  sim_crash: number
  page_unload: number
  other: number
}

interface SessionEndData {
  totalSessions: number
  byReason: EndReasonEntry[]
  crashRate: number
  completionRate: number
  abandonmentRate: number
  trendOverTime: TrendEntry[]
  incompleteCount: number
}

const SessionEndReport = () => {
  const { dateRange, setDateRange, fetchSessionEnd } = useReports()
  const { data, loading, error, reload } = useReportData(fetchSessionEnd, [dateRange])

  if (loading) return <LoadingState />
  if (error) return <ErrorDisplay message={error} onRetry={reload} />
  if (!data) return <p>No data available.</p>

  return (
    <div>
      <div style={styles.headerRow}>
        <DateRangeFilter value={dateRange} onChange={setDateRange} />
        {data.byReason.length > 0 && (
          <ExportButton data={data.byReason} filename="session-end" />
        )}
      </div>
      <div style={styles.statsRow}>
        <StatCard
          title="Total Sessions"
          value={data.totalSessions}
          color="#0066cc"
        />
        <StatCard
          title="Completion Rate"
          value={`${data.completionRate}%`}
          color="#27ae60"
        />
        <StatCard
          title="Crash Rate"
          value={`${data.crashRate}%`}
          color="#e74c3c"
        />
        <StatCard
          title="Abandoned"
          value={data.incompleteCount}
          color="#f39c12"
        />
      </div>

      {data.byReason.length > 0 && (
        <div style={styles.chartContainer}>
          <h3 style={styles.chartTitle}>Sessions by End Reason</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.byReason}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="reason" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#0066cc" name="Sessions" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {data.trendOverTime.length > 0 && (
        <div style={styles.chartContainer}>
          <h3 style={styles.chartTitle}>End Reasons Over Time (30 days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.trendOverTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="user_stop"
                stroke="#27ae60"
                name="User Stop"
              />
              <Line
                type="monotone"
                dataKey="sim_crash"
                stroke="#e74c3c"
                name="Crash"
              />
              <Line
                type="monotone"
                dataKey="page_unload"
                stroke="#f39c12"
                name="Page Unload"
              />
              <Line
                type="monotone"
                dataKey="other"
                stroke="#95a5a6"
                name="Other"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div style={styles.tableContainer}>
        <h3 style={styles.tableTitle}>End Reason Breakdown</h3>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Reason</th>
              <th style={styles.th}>Count</th>
              <th style={styles.th}>Percentage</th>
            </tr>
          </thead>
          <tbody>
            {data.byReason.map((r) => (
              <EndReasonRow
                key={r.reason}
                reason={r.reason}
                count={r.count}
                percentage={
                  data.totalSessions > 0
                    ? Math.round((r.count / data.totalSessions) * 100)
                    : 0
                }
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const EndReasonRow = ({
  reason,
  count,
  percentage,
}: {
  reason: string
  count: number
  percentage: number
}) => (
  <tr>
    <td style={styles.td}>{reason}</td>
    <td style={{ ...styles.td, textAlign: "center" }}>{count}</td>
    <td style={{ ...styles.td, textAlign: "center" }}>{percentage}%</td>
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

export default SessionEndReport
