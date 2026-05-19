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
} from "recharts"
import StatCard from "../components/StatCard"
import ErrorDisplay from "../components/ErrorDisplay"
import { useReports } from "../hooks/useReports"
import { DateRangeFilter } from "../components/DateRangeFilter"

interface ActivityData {
  totalSessions: number
  avgDurationMs: number
  topExamples: { name: string; count: number }[]
  sessionsByDay: { day: string; count: number }[]
}

const ActivityReport = () => {
  const { dateRange, setDateRange, fetchActivity } = useReports()
  const [data, setData] = React.useState<ActivityData | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const loadData = React.useCallback(() => {
    setLoading(true)
    setError(null)
    fetchActivity()
      .then((d) => {
        setData(d)
        setLoading(false)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load activity data")
        setLoading(false)
      })
  }, [fetchActivity])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  if (loading) return <p>Loading...</p>
  if (error) return <ErrorDisplay message={error} onRetry={loadData} />
  if (!data) return <p>No data available.</p>

  const formatDuration = (ms: number) => {
    const mins = Math.floor(ms / 60000)
    return mins > 0 ? `${mins} min` : "< 1 min"
  }

  return (
    <div>
      <DateRangeFilter value={dateRange} onChange={setDateRange} />
      <div style={styles.statsRow}>
        <StatCard title="Total Sessions" value={data.totalSessions} color="#0066cc" />
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
              <Line type="monotone" dataKey="count" stroke="#27ae60" name="Sessions" />
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
