import React from "react"
import {
  BarChart,
  Bar,
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

interface BoardEntry {
  board: string
  sessions: number
  percentage: number
  avgDurationMs: number
}

interface BoardUsageData {
  boardPerformance: BoardEntry[]
  totalSessions: number
  mostPopularBoard: string
  popularBoardPerSketch: { sketch: string; board: string; count: number }[]
}

const BoardUsageReport = () => {
  const { dateRange, setDateRange, fetchBoardUsage } = useReports()
  const [data, setData] = React.useState<BoardUsageData | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const loadData = React.useCallback(() => {
    setLoading(true)
    setError(null)
    fetchBoardUsage()
      .then((d) => {
        setData(d)
        setLoading(false)
      })
      .catch((err) => {
        setError(
          err instanceof Error ? err.message : "Failed to load board usage data"
        )
        setLoading(false)
      })
  }, [fetchBoardUsage])

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
        <StatCard
          title="Total Sessions"
          value={data.totalSessions}
          color="#0066cc"
        />
        <StatCard
          title="Most Popular Board"
          value={data.mostPopularBoard}
          color="#27ae60"
        />
        <StatCard
          title="Board Types"
          value={data.boardPerformance.length}
          color="#8e44ad"
        />
      </div>

      {data.boardPerformance.length > 0 && (
        <div style={styles.chartContainer}>
          <h3 style={styles.chartTitle}>Board Type Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.boardPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="board" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sessions" fill="#0066cc" name="Sessions" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div style={styles.tableContainer}>
        <h3 style={styles.tableTitle}>Board Performance</h3>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Board</th>
              <th style={styles.th}>Sessions</th>
              <th style={styles.th}>Share</th>
              <th style={styles.th}>Avg Duration</th>
            </tr>
          </thead>
          <tbody>
            {data.boardPerformance.map((b, _i) => (
              <BoardRow
                key={b.board}
                board={b.board}
                sessions={b.sessions}
                percentage={b.percentage}
                avgDuration={formatDuration(b.avgDurationMs)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {data.popularBoardPerSketch.length > 0 && (
        <div style={styles.tableContainer}>
          <h3 style={styles.tableTitle}>Most Popular Board per Sketch (Top 10)</h3>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Sketch</th>
                <th style={styles.th}>Board</th>
                <th style={styles.th}>Usage Count</th>
              </tr>
            </thead>
            <tbody>
              {data.popularBoardPerSketch.map((item, _i) => (
                <SketchBoardRow
                  key={item.sketch}
                  sketch={item.sketch}
                  board={item.board}
                  count={item.count}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

const BoardRow = ({
  board,
  sessions,
  percentage,
  avgDuration,
}: {
  board: string
  sessions: number
  percentage: number
  avgDuration: string
}) => (
  <tr>
    <td style={styles.td}>{board}</td>
    <td style={{ ...styles.td, textAlign: "center" }}>{sessions}</td>
    <td style={{ ...styles.td, textAlign: "center" }}>{percentage}%</td>
    <td style={styles.td}>{avgDuration}</td>
  </tr>
)

const SketchBoardRow = ({
  sketch,
  board,
  count,
}: {
  sketch: string
  board: string
  count: number
}) => (
  <tr>
    <td style={styles.td}>{sketch}</td>
    <td style={styles.td}>{board}</td>
    <td style={{ ...styles.td, textAlign: "center" }}>{count}</td>
  </tr>
)

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

export default BoardUsageReport
