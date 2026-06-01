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
} from "recharts"
import StatCard from "../components/StatCard"
import ErrorDisplay from "../components/ErrorDisplay"
import LoadingState from "../components/LoadingState"
import ExportButton from "../components/ExportButton"
import { useReports } from "../hooks/useReports"
import { useReportData } from "../hooks/useReportData"
import { DateRangeFilter } from "../components/DateRangeFilter"
import { formatDuration } from "../utils/formatDuration"

interface ActivityData {
  totalSessions: number
  avgDurationMs: number
  topExamples: { name: string; count: number }[]
  sessionsByDay: { day: string; count: number }[]
}

const ActivityReport = () => {
  const { dateRange, setDateRange, fetchActivity } = useReports()
  const { data, loading, error, reload } = useReportData(fetchActivity, [dateRange])

  if (loading) return <LoadingState />
  if (error) return <ErrorDisplay message={error} onRetry={reload} />
  if (!data) return <p>No data available.</p>

  return (
    <div>
      <div style={styles.headerRow}>
        <DateRangeFilter value={dateRange} onChange={setDateRange} />
        {data.topExamples.length > 0 && (
          <ExportButton data={data.topExamples} filename="activity-top-examples" />
        )}
      </div>
      <div style={styles.statsRow}>
        <StatCard
          title="Total Sessions"
          value={data.totalSessions}
          color="#0066cc"
        />
        <StatCard
          title="Avg. Duration"
          value={formatDuration(data.avgDurationMs)}
          color="#27ae60"
        />
      </div>
      {data.topExamples.length > 0 && (
        <div style={styles.chartContainer}>
          <h3 style={styles.chartTitle}>Top Examples</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.topExamples}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#0066cc" name="Attempts" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      {data.sessionsByDay.length > 0 && (
        <div style={styles.chartContainer}>
          <h3 style={styles.chartTitle}>Sessions (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.sessionsByDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#27ae60"
                name="Sessions"
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

export default ActivityReport
