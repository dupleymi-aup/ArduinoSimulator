import React from "react"
import {
  BarChart,
  Bar,
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

interface ComparativeData {
  byTimeOfDay: {
    period: string
    sessions: number
    completionRate: number
    avgDurationMs: number
  }[]
  byDayOfWeek: {
    day: string
    sessions: number
    completionRate: number
  }[]
  byBoardType: {
    board: string
    sessions: number
    completionRate: number
    errorRate: number
  }[]
  fastVsSlow: {
    fast: { count: number; completionRate: number }
    slow: { count: number; completionRate: number }
  }
  medianDurationMs: number
  totalSessions: number
}

const ComparativeReport = () => {
  const { dateRange, setDateRange, fetchComparative } = useReports()
  const [data, setData] = React.useState<ComparativeData | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const loadData = React.useCallback(() => {
    setLoading(true)
    setError(null)
    fetchComparative()
      .then((d) => {
        setData(d as ComparativeData | null)
        setLoading(false)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load comparative data")
        setLoading(false)
      })
  }, [fetchComparative])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  if (loading) return <LoadingState />
  if (error) return <ErrorDisplay message={error} onRetry={loadData} />
  if (!data) return <p>No data available.</p>

  const formatDuration = (ms: number) => {
    const mins = Math.floor(ms / 60000)
    return mins > 0 ? `${mins} min` : "< 1 min"
  }

  const timeOfDayData = data.byTimeOfDay.map((d) => ({
    ...d,
    period: d.period.charAt(0).toUpperCase() + d.period.slice(1),
  }))

  const boardComparisonData = data.byBoardType.map((d) => ({
    board: d.board,
    completionRate: d.completionRate,
    errorRate: d.errorRate,
  }))

  return (
    <div>
      <div style={styles.headerRow}>
        <DateRangeFilter value={dateRange} onChange={setDateRange} />
        {data.byTimeOfDay.length > 0 && (
          <ExportButton data={data.byTimeOfDay} filename="comparative-analysis" />
        )}
      </div>
      <div style={styles.statsRow}>
        <StatCard title="Total Sessions" value={data.totalSessions} color="#0066cc" />
        <StatCard
          title="Median Duration"
          value={formatDuration(data.medianDurationMs)}
          color="#8e44ad"
        />
        <StatCard
          title="Fast Completion"
          value={`${data.fastVsSlow.fast.completionRate}%`}
          color="#27ae60"
        />
        <StatCard
          title="Slow Completion"
          value={`${data.fastVsSlow.slow.completionRate}%`}
          color="#f39c12"
        />
      </div>

      <div style={styles.chartContainer}>
        <h3 style={styles.chartTitle}>Sessions by Time of Day</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={timeOfDayData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="sessions" fill="#0066cc" name="Sessions" />
            <Bar dataKey="completionRate" fill="#27ae60" name="Completion Rate (%)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={styles.chartContainer}>
        <h3 style={styles.chartTitle}>Sessions by Day of Week</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data.byDayOfWeek}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="sessions" fill="#3498db" name="Sessions" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {boardComparisonData.length > 0 && (
        <div style={styles.chartContainer}>
          <h3 style={styles.chartTitle}>Board Type Comparison</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={boardComparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="board" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="completionRate" fill="#27ae60" name="Completion Rate (%)" />
              <Bar dataKey="errorRate" fill="#e74c3c" name="Error Rate (%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div style={styles.chartContainer}>
        <h3 style={styles.chartTitle}>Fast vs Slow Students</h3>
        <div style={styles.comparisonCards}>
          <div style={styles.card}>
            <h4 style={styles.cardTitle}>Fast Students</h4>
            <p style={styles.cardValue}>{data.fastVsSlow.fast.count} sessions</p>
            <p style={styles.cardSub}>
              Completion: {data.fastVsSlow.fast.completionRate}%
            </p>
          </div>
          <div style={styles.card}>
            <h4 style={styles.cardTitle}>Slow Students</h4>
            <p style={styles.cardValue}>{data.fastVsSlow.slow.count} sessions</p>
            <p style={styles.cardSub}>
              Completion: {data.fastVsSlow.slow.completionRate}%
            </p>
          </div>
        </div>
      </div>
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
  comparisonCards: {
    display: "flex",
    gap: 16,
    flexWrap: "wrap",
  },
  card: {
    flex: 1,
    minWidth: 200,
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    border: "1px solid #e0e0e0",
  },
  cardTitle: {
    margin: "0 0 8px",
    fontSize: 14,
    color: "#666",
  },
  cardValue: {
    margin: "0 0 4px",
    fontSize: 24,
    fontWeight: 700,
    color: "#333",
  },
  cardSub: {
    margin: 0,
    fontSize: 13,
    color: "#888",
  },
}

export default ComparativeReport
