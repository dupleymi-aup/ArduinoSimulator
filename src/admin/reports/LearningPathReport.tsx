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

interface LearningPathData {
  popularPaths: { path: string; count: number }[]
  sketchAnalysis: {
    name: string
    attempts: number
    completions: number
    completionRate: number
    avgDurationMs: number
    repeats: number
  }[]
  stuckSketches: {
    name: string
    attempts: number
    repeats: number
    completionRate: number
  }[]
  totalPaths: number
  totalStudents: number
}

const LearningPathReport = () => {
  const { dateRange, setDateRange, fetchLearningPath } = useReports()
  const [data, setData] = React.useState<LearningPathData | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const loadData = React.useCallback(() => {
    setLoading(true)
    setError(null)
    fetchLearningPath()
      .then((d) => {
        setData(d as LearningPathData | null)
        setLoading(false)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load learning path data")
        setLoading(false)
      })
  }, [fetchLearningPath])

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

  const pathChartData = data.popularPaths.slice(0, 10).map((p) => ({
    path: p.path.length > 30 ? p.path.slice(0, 30) + "..." : p.path,
    count: p.count,
  }))

  return (
    <div>
      <div style={styles.headerRow}>
        <DateRangeFilter value={dateRange} onChange={setDateRange} />
        {data.popularPaths.length > 0 && (
          <ExportButton data={data.popularPaths} filename="learning-paths" />
        )}
      </div>
      <div style={styles.statsRow}>
        <StatCard title="Total Students" value={data.totalStudents} color="#0066cc" />
        <StatCard title="Unique Paths" value={data.totalPaths} color="#8e44ad" />
        <StatCard
          title="Stuck Sketches"
          value={data.stuckSketches.length}
          color="#e74c3c"
        />
      </div>

      {pathChartData.length > 0 && (
        <div style={styles.chartContainer}>
          <h3 style={styles.chartTitle}>Most Popular Learning Paths</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={pathChartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="path" type="category" width={180} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#0066cc" name="Transitions" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {data.stuckSketches.length > 0 && (
        <div style={styles.chartContainer}>
          <h3 style={styles.chartTitle}>Where Students Get Stuck</h3>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Sketch</th>
                  <th style={styles.th}>Attempts</th>
                  <th style={styles.th}>Repeats</th>
                  <th style={styles.th}>Completion Rate</th>
                </tr>
              </thead>
              <tbody>
                {data.stuckSketches.map((s) => (
                  <tr key={s.name}>
                    <td style={styles.td}>{s.name}</td>
                    <td style={styles.td}>{s.attempts}</td>
                    <td style={{ ...styles.td, color: "#e74c3c", fontWeight: 600 }}>
                      {s.repeats}
                    </td>
                    <td style={styles.td}>{s.completionRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div style={styles.chartContainer}>
        <h3 style={styles.chartTitle}>Sketch Analysis</h3>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Sketch</th>
                <th style={styles.th}>Attempts</th>
                <th style={styles.th}>Completions</th>
                <th style={styles.th}>Completion Rate</th>
                <th style={styles.th}>Avg Duration</th>
                <th style={styles.th}>Repeats</th>
              </tr>
            </thead>
            <tbody>
              {data.sketchAnalysis.map((s) => (
                <tr key={s.name}>
                  <td style={styles.td}>{s.name}</td>
                  <td style={styles.td}>{s.attempts}</td>
                  <td style={styles.td}>{s.completions}</td>
                  <td style={styles.td}>{s.completionRate}%</td>
                  <td style={styles.td}>{formatDuration(s.avgDurationMs)}</td>
                  <td style={styles.td}>{s.repeats}</td>
                </tr>
              ))}
            </tbody>
          </table>
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

export default LearningPathReport
