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
  Legend,
} from "recharts"
import StatCard from "../components/StatCard"
import ErrorDisplay from "../components/ErrorDisplay"
import LoadingState from "../components/LoadingState"
import ExportButton from "../components/ExportButton"
import { useReports } from "../hooks/useReports"
import { useReportData } from "../hooks/useReportData"
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
  const { data, loading, error, reload } = useReportData(fetchErrorTrends, [dateRange])

  if (loading) return <LoadingState />
  if (error) return <ErrorDisplay message={error} onRetry={reload} />
  if (!data) return <p>No data available.</p>

  return (
    <div>
      <div style={styles.headerRow}>
        <DateRangeFilter value={dateRange} onChange={setDateRange} />
        {data.errorCategories.length > 0 && (
          <ExportButton data={data.errorCategories} filename="error-trends" />
        )}
      </div>
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
              <Legend />
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
              <Legend />
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
              <Legend />
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

export default ErrorTrendReport
