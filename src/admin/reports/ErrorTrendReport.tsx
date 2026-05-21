import React from "react"
import {
  LineChart,
  Line,
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

interface ErrorTrendData {
  errorTrend: { day: string; count: number }[]
  errorCategories: { category: string; count: number }[]
  errorsByBoard: {
    board: string
    total: number
    errors: number
    errorRate: number
  }[]
  totalErrors: number
  errorResolutionRate: number
}

const ErrorTrendReport = () => {
  const { dateRange, setDateRange, fetchErrorTrends } = useReports()
  const [data, setData] = React.useState<ErrorTrendData | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const loadData = React.useCallback(() => {
    setLoading(true)
    setError(null)
    fetchErrorTrends()
      .then((d) => {
        setData(d)
        setLoading(false)
      })
      .catch((err) => {
        setError(
          err instanceof Error ? err.message : "Failed to load error trend data"
        )
        setLoading(false)
      })
  }, [fetchErrorTrends])

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
        <StatCard title="Total Errors" value={data.totalErrors} color="#e74c3c" />
        <StatCard
          title="Resolution Rate"
          value={`${data.errorResolutionRate}%`}
          color={data.errorResolutionRate >= 50 ? "#27ae60" : "#e67e22"}
        />
      </div>

      {data.errorTrend.length > 0 && (
        <div style={styles.chartContainer}>
          <h3 style={styles.chartTitle}>Error Frequency (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.errorTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#e74c3c" name="Errors" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {data.errorCategories.length > 0 && (
        <div style={styles.chartContainer}>
          <h3 style={styles.chartTitle}>Top Error Categories</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.errorCategories}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#e74c3c" name="Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {data.errorCategories.length > 0 && (
        <div style={styles.tableContainer}>
          <h3 style={styles.tableTitle}>Error Categories Breakdown</h3>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Category</th>
                <th style={styles.th}>Count</th>
              </tr>
            </thead>
            <tbody>
              {data.errorCategories.map((c, _i) => (
                <ErrorCategoryRow
                  key={c.category}
                  category={c.category}
                  count={c.count}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data.errorsByBoard.length > 0 && (
        <div style={styles.chartContainer}>
          <h3 style={styles.chartTitle}>Errors by Board Type</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.errorsByBoard}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="board" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" fill="#0066cc" name="Total Sessions" />
              <Bar dataKey="errors" fill="#e74c3c" name="Sessions with Errors" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {data.errorsByBoard.length > 0 && (
        <div style={styles.tableContainer}>
          <h3 style={styles.tableTitle}>Board Error Rates</h3>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Board</th>
                <th style={styles.th}>Total Sessions</th>
                <th style={styles.th}>With Errors</th>
                <th style={styles.th}>Error Rate</th>
              </tr>
            </thead>
            <tbody>
              {data.errorsByBoard.map((b, _i) => (
                <BoardErrorRow
                  key={b.board}
                  board={b.board}
                  total={b.total}
                  errors={b.errors}
                  errorRate={b.errorRate}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

const ErrorCategoryRow = ({
  category,
  count,
}: {
  category: string
  count: number
}) => (
  <tr>
    <td style={styles.td}>{category}</td>
    <td style={{ ...styles.td, textAlign: "center" }}>{count}</td>
  </tr>
)

const BoardErrorRow = ({
  board,
  total,
  errors,
  errorRate,
}: {
  board: string
  total: number
  errors: number
  errorRate: number
}) => (
  <tr>
    <td style={styles.td}>{board}</td>
    <td style={{ ...styles.td, textAlign: "center" }}>{total}</td>
    <td style={{ ...styles.td, textAlign: "center" }}>{errors}</td>
    <td
      style={{
        ...styles.td,
        textAlign: "center",
        color: errorRate > 30 ? "#e74c3c" : "#27ae60",
        fontWeight: 600,
      }}
    >
      {errorRate}%
    </td>
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

export default ErrorTrendReport
