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

interface Scorecard {
  identifier: string
  studentId: string
  totalSessions: number
  completedSessions: number
  completionRate: number
  avgDurationMs: number
  totalErrors: number
  uniqueSketches: number
  score: number
  level: string
}

interface ScorecardData {
  scorecards: Scorecard[]
  levelDistribution: { level: string; count: number }[]
  totalStudents: number
  avgScore: number
}

const LEVEL_COLORS: Record<string, string> = {
  Beginner: "#e74c3c",
  Intermediate: "#f39c12",
  Advanced: "#27ae60",
}

const StudentScorecardReport = () => {
  const { dateRange, setDateRange, fetchStudentScorecard } = useReports()
  const { data, loading, error, reload } = useReportData(fetchStudentScorecard, [dateRange])

  if (loading) return <LoadingState />
  if (error) return <ErrorDisplay message={error} onRetry={reload} />
  if (!data) return <p>No data available.</p>

  const formatDuration = (ms: number) => {
    const mins = Math.floor(ms / 60000)
    return mins > 0 ? `${mins} min` : "< 1 min"
  }

  return (
    <div>
      <div style={styles.headerRow}>
        <DateRangeFilter value={dateRange} onChange={setDateRange} />
        {data.scorecards.length > 0 && (
          <ExportButton data={data.scorecards} filename="student-scorecard" />
        )}
      </div>
      <div style={styles.statsRow}>
        <StatCard title="Total Students" value={data.totalStudents} color="#0066cc" />
        <StatCard title="Avg Score" value={`${data.avgScore}/100`} color="#8e44ad" />
        <StatCard
          title="Advanced"
          value={data.levelDistribution.find((l) => l.level === "Advanced")?.count || 0}
          color="#27ae60"
        />
        <StatCard
          title="Beginner"
          value={data.levelDistribution.find((l) => l.level === "Beginner")?.count || 0}
          color="#e74c3c"
        />
      </div>

      <div style={styles.chartContainer}>
        <h3 style={styles.chartTitle}>Level Distribution</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data.levelDistribution}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="level" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#0066cc" name="Students" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={styles.chartContainer}>
        <h3 style={styles.chartTitle}>Student Rankings</h3>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>#</th>
                <th style={styles.th}>Student</th>
                <th style={styles.th}>Score</th>
                <th style={styles.th}>Level</th>
                <th style={styles.th}>Sessions</th>
                <th style={styles.th}>Completion</th>
                <th style={styles.th}>Avg Duration</th>
                <th style={styles.th}>Errors</th>
                <th style={styles.th}>Sketches</th>
              </tr>
            </thead>
            <tbody>
              {data.scorecards.map((s, i) => (
                <tr key={s.studentId} style={i % 2 === 0 ? styles.trEven : styles.trOdd}>
                  <td style={styles.td}>{i + 1}</td>
                  <td style={styles.td}>{s.identifier}</td>
                  <td style={{ ...styles.td, fontWeight: 700 }}>{s.score}</td>
                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.levelBadge,
                        backgroundColor: LEVEL_COLORS[s.level] || "#999",
                      }}
                    >
                      {s.level}
                    </span>
                  </td>
                  <td style={styles.td}>{s.totalSessions}</td>
                  <td style={styles.td}>{s.completionRate}%</td>
                  <td style={styles.td}>{formatDuration(s.avgDurationMs)}</td>
                  <td style={styles.td}>{s.totalErrors}</td>
                  <td style={styles.td}>{s.uniqueSketches}</td>
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
  trEven: {
    backgroundColor: "#fafafa",
  },
  trOdd: {
    backgroundColor: "#fff",
  },
  levelBadge: {
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: 12,
    color: "#fff",
    fontSize: 11,
    fontWeight: 600,
  },
}

export default StudentScorecardReport
