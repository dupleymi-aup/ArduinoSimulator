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

interface CohortWeekEntry {
  week: string
  studentCount: number
}

interface TopStudentEntry {
  identifier: string
  sessionCount: number
  lastActive: string
}

interface RetentionData {
  returned7d: number
  returned14d: number
  returned30d: number
  activeStudents: number
}

interface StudentCohortData {
  totalStudents: number
  returningStudentPct: number
  avgSessionsPerStudent: number
  cohortsByWeek: CohortWeekEntry[]
  retentionData: RetentionData
  newVsReturning: { new: number; returning: number }
  topStudents: TopStudentEntry[]
}

const StudentCohortReport = () => {
  const { dateRange, setDateRange, fetchStudentCohort } = useReports()
  const [data, setData] = React.useState<StudentCohortData | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const loadData = React.useCallback(() => {
    setLoading(true)
    setError(null)
    fetchStudentCohort()
      .then((d) => {
        setData(d)
        setLoading(false)
      })
      .catch((err) => {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load student cohort data"
        )
        setLoading(false)
      })
  }, [fetchStudentCohort])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  if (loading) return <LoadingState />
  if (error) return <ErrorDisplay message={error} onRetry={loadData} />
  if (!data) return <p>No data available.</p>

  const { retentionData, newVsReturning } = data
  const retentionRates = retentionData.activeStudents > 0
    ? {
        r7: Math.round((retentionData.returned7d / retentionData.activeStudents) * 100),
        r14: Math.round((retentionData.returned14d / retentionData.activeStudents) * 100),
        r30: Math.round((retentionData.returned30d / retentionData.activeStudents) * 100),
      }
    : { r7: 0, r14: 0, r30: 0 }

  return (
    <div>
      <div style={styles.headerRow}>
        <DateRangeFilter value={dateRange} onChange={setDateRange} />
        {data.topStudents.length > 0 && (
          <ExportButton data={data.topStudents} filename="student-cohort" />
        )}
      </div>
      <div style={styles.statsRow}>
        <StatCard
          title="Total Students"
          value={data.totalStudents}
          color="#0066cc"
        />
        <StatCard
          title="Returning Students"
          value={`${data.returningStudentPct}%`}
          color="#27ae60"
        />
        <StatCard
          title="Avg Sessions/Student"
          value={data.avgSessionsPerStudent}
          color="#8e44ad"
        />
        <StatCard
          title="New Students"
          value={newVsReturning.new}
          color="#f39c12"
        />
      </div>

      {data.cohortsByWeek.length > 0 && (
        <div style={styles.chartContainer}>
          <h3 style={styles.chartTitle}>Students by Registration Week</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.cohortsByWeek}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="studentCount" fill="#0066cc" name="Students" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div style={styles.retentionContainer}>
        <h3 style={styles.tableTitle}>Retention Rates</h3>
        <div style={styles.retentionGrid}>
          <div style={styles.retentionCard}>
            <div style={styles.retentionValue}>{retentionRates.r7}%</div>
            <div style={styles.retentionLabel}>Returned within 7 days</div>
          </div>
          <div style={styles.retentionCard}>
            <div style={styles.retentionValue}>{retentionRates.r14}%</div>
            <div style={styles.retentionLabel}>Returned within 14 days</div>
          </div>
          <div style={styles.retentionCard}>
            <div style={styles.retentionValue}>{retentionRates.r30}%</div>
            <div style={styles.retentionLabel}>Returned within 30 days</div>
          </div>
        </div>
      </div>

      {data.topStudents.length > 0 && (
        <div style={styles.tableContainer}>
          <h3 style={styles.tableTitle}>Most Active Students</h3>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Student</th>
                <th style={styles.th}>Sessions</th>
                <th style={styles.th}>Last Active</th>
              </tr>
            </thead>
            <tbody>
              {data.topStudents.map((s) => (
                <TopStudentRow
                  key={s.identifier}
                  identifier={s.identifier}
                  sessionCount={s.sessionCount}
                  lastActive={s.lastActive}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

const TopStudentRow = ({
  identifier,
  sessionCount,
  lastActive,
}: {
  identifier: string
  sessionCount: number
  lastActive: string
}) => (
  <tr>
    <td style={styles.td}>{identifier}</td>
    <td style={{ ...styles.td, textAlign: "center" }}>{sessionCount}</td>
    <td style={styles.td}>
      {new Date(lastActive).toLocaleDateString()}
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
  retentionContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 20,
    marginBottom: 16,
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
  },
  retentionGrid: {
    display: "flex",
    gap: 16,
    flexWrap: "wrap",
  },
  retentionCard: {
    flex: 1,
    minWidth: 150,
    textAlign: "center",
    padding: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 6,
  },
  retentionValue: {
    fontSize: 32,
    fontWeight: 700,
    color: "#0066cc",
  },
  retentionLabel: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
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

export default StudentCohortReport
