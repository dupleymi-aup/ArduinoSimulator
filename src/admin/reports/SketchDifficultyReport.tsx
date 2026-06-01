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
import { useReportData } from "../hooks/useReportData"
import { DateRangeFilter } from "../components/DateRangeFilter"
import { formatDuration } from "../utils/formatDuration"

interface SketchEntry {
  name: string
  attempts: number
  completions: number
  completionRate: number
  avgDurationMs: number
  errorCount: number
}

interface SketchDifficultyData {
  sketches: SketchEntry[]
  mostAttempted: SketchEntry | null
  leastAttempted: SketchEntry | null
  hardestSketch: SketchEntry
}

const SketchDifficultyReport = () => {
  const { dateRange, setDateRange, fetchSketchDifficulty } = useReports()
  const { data, loading, error, reload } = useReportData(fetchSketchDifficulty, [dateRange])

  if (loading) return <LoadingState />
  if (error) return <ErrorDisplay message={error} onRetry={reload} />
  if (!data) return <p>No data available.</p>

  const avgCompletionRate =
    data.sketches.length > 0
      ? Math.round(
          data.sketches.reduce((s, sk) => s + sk.completionRate, 0) /
            data.sketches.length
        )
      : 0

  const sortedByDifficulty = [...data.sketches]
    .filter((s) => s.attempts >= 2)
    .sort((a, b) => a.completionRate - b.completionRate)
    .slice(0, 10)

  return (
    <div>
      <div style={styles.headerRow}>
        <DateRangeFilter value={dateRange} onChange={setDateRange} />
        {data.sketches.length > 0 && (
          <ExportButton data={data.sketches} filename="sketch-difficulty" />
        )}
      </div>
      <div style={styles.statsRow}>
        <StatCard
          title="Total Sketches"
          value={data.sketches.length}
          color="#0066cc"
        />
        <StatCard
          title="Avg Completion Rate"
          value={`${avgCompletionRate}%`}
          color={avgCompletionRate >= 50 ? "#27ae60" : "#e74c3c"}
        />
        {data.hardestSketch?.name && (
          <StatCard
            title="Hardest Sketch"
            value={data.hardestSketch.name}
            subtitle={`${data.hardestSketch.completionRate}% complete`}
            color="#e74c3c"
          />
        )}
      </div>

      {data.sketches.length > 0 && (
        <div style={styles.chartContainer}>
          <h3 style={styles.chartTitle}>Attempts per Sketch</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.sketches.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="attempts" fill="#0066cc" name="Attempts" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {sortedByDifficulty.length > 0 && (
        <div style={styles.chartContainer}>
          <h3 style={styles.chartTitle}>Completion Rate by Sketch</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sortedByDifficulty}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="completionRate" fill="#e74c3c" name="Completion %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div style={styles.tableContainer}>
        <h3 style={styles.tableTitle}>Sketch Details (sorted by difficulty)</h3>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Sketch</th>
              <th style={styles.th}>Attempts</th>
              <th style={styles.th}>Completions</th>
              <th style={styles.th}>Completion %</th>
              <th style={styles.th}>Avg Duration</th>
              <th style={styles.th}>Errors</th>
            </tr>
          </thead>
          <tbody>
            {[...data.sketches]
              .sort((a, b) => a.completionRate - b.completionRate)
              .map((sk) => (
                <SketchRow
                  key={sk.name}
                  sketch={sk}
                  formatDuration={formatDuration}
                />
              ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const SketchRow = ({
  sketch,
  formatDuration,
}: {
  sketch: SketchEntry
  formatDuration: (_ms: number) => string
}) => (
  <tr>
    <td style={styles.td}>{sketch.name}</td>
    <td style={{ ...styles.td, textAlign: "center" }}>{sketch.attempts}</td>
    <td style={{ ...styles.td, textAlign: "center" }}>{sketch.completions}</td>
    <td
      style={{
        ...styles.td,
        textAlign: "center",
        color: sketch.completionRate >= 70 ? "#27ae60" : "#e74c3c",
        fontWeight: 600,
      }}
    >
      {sketch.completionRate}%
    </td>
    <td style={styles.td}>{formatDuration(sketch.avgDurationMs)}</td>
    <td style={{ ...styles.td, textAlign: "center" }}>{sketch.errorCount}</td>
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

export default SketchDifficultyReport
