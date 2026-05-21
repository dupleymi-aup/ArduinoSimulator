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

interface StudentEntry {
  studentId: string
  identifier: string
  totalSessions: number
  totalDurationMs: number
  avgDurationMs: number
  lastSessionAt: string
}

interface StudentEngagementData {
  students: StudentEntry[]
  heatmapByDay: { day: string; count: number }[]
  heatmapByHour: { hour: string; count: number }[]
  atRiskStudents: StudentEntry[]
  totalActiveStudents: number
}

const StudentEngagementReport = () => {
  const { dateRange, setDateRange, fetchStudentEngagement, fetchStudentDetail } =
    useReports()
  const [data, setData] = React.useState<StudentEngagementData | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [selectedStudent, setSelectedStudent] = React.useState<string | null>(null)
  const [studentDetail, setStudentDetail] = React.useState<Record<
    string,
    unknown
  > | null>(null)
  const [detailLoading, setDetailLoading] = React.useState(false)

  const loadData = React.useCallback(() => {
    setLoading(true)
    setError(null)
    setSelectedStudent(null)
    setStudentDetail(null)
    fetchStudentEngagement()
      .then((d) => {
        setData(d as StudentEngagementData)
        setLoading(false)
      })
      .catch((err) => {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load student engagement data"
        )
        setLoading(false)
      })
  }, [fetchStudentEngagement])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  const handleStudentClick = React.useCallback(
    (studentId: string) => {
      setSelectedStudent(studentId)
      setDetailLoading(true)
      setStudentDetail(null)
      fetchStudentDetail(studentId)
        .then((d) => {
          setStudentDetail(d as Record<string, unknown> | null)
          setDetailLoading(false)
        })
        .catch(() => {
          setDetailLoading(false)
        })
    },
    [fetchStudentDetail]
  )

  if (loading) return <LoadingState />
  if (error) return <ErrorDisplay message={error} onRetry={loadData} />
  if (!data) return <p>No data available.</p>

  const formatDuration = (ms: number) => {
    const mins = Math.floor(ms / 60000)
    const hours = Math.floor(mins / 60)
    return hours > 0 ? `${hours}h ${mins % 60}m` : `${mins}m`
  }

  const totalSessions = data.students.reduce((s, st) => s + st.totalSessions, 0)
  const avgDuration =
    data.students.length > 0
      ? Math.round(
          data.students.reduce((s, st) => s + st.avgDurationMs, 0) /
            data.students.length
        )
      : 0

  const leaderboard = data.students.slice(0, 10)

  return (
    <div>
      <div style={styles.headerRow}>
        <DateRangeFilter value={dateRange} onChange={setDateRange} />
        {data.students.length > 0 && (
          <ExportButton data={data.students as unknown as Record<string, unknown>[]} filename="student-engagement" />
        )}
      </div>
      <div style={styles.statsRow}>
        <StatCard
          title="Active Students"
          value={data.totalActiveStudents}
          color="#0066cc"
        />
        <StatCard title="Total Sessions" value={totalSessions} color="#27ae60" />
        <StatCard
          title="Avg Duration"
          value={formatDuration(avgDuration)}
          color="#8e44ad"
        />
      </div>

      {leaderboard.length > 0 && (
        <div style={styles.chartContainer}>
          <h3 style={styles.chartTitle}>Top Students by Sessions</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={leaderboard}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="identifier" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="totalSessions" fill="#0066cc" name="Sessions" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {data.heatmapByDay.length > 0 && (
        <div style={styles.chartContainer}>
          <h3 style={styles.chartTitle}>Activity by Day of Week</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.heatmapByDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#3498db" name="Sessions" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {data.heatmapByHour.length > 0 && (
        <div style={styles.chartContainer}>
          <h3 style={styles.chartTitle}>Activity by Hour of Day</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.heatmapByHour}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#e67e22" name="Sessions" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {data.atRiskStudents.length > 0 && (
        <div style={styles.tableContainer}>
          <h3 style={styles.tableTitle}>
            At-Risk Students (No Activity &gt;14 Days)
          </h3>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Student</th>
                <th style={styles.th}>Sessions</th>
                <th style={styles.th}>Last Active</th>
              </tr>
            </thead>
            <tbody>
              {data.atRiskStudents.map((s, _i) => (
                <AtRiskRow
                  key={s.studentId}
                  student={s}
                  onClick={handleStudentClick}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={styles.tableContainer}>
        <h3 style={styles.tableTitle}>All Students (click for details)</h3>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Student</th>
              <th style={styles.th}>Sessions</th>
              <th style={styles.th}>Avg Duration</th>
              <th style={styles.th}>Last Active</th>
            </tr>
          </thead>
          <tbody>
            {data.students.map((s, _i) => (
              <StudentRow
                key={s.studentId}
                student={s}
                selected={selectedStudent === s.studentId}
                onClick={handleStudentClick}
                formatDuration={formatDuration}
              />
            ))}
          </tbody>
        </table>
      </div>

      {selectedStudent && (
        <div style={styles.detailPanel}>
          <h3 style={styles.detailTitle}>
            Student Detail{" "}
            <button style={styles.closeBtn} onClick={() => setSelectedStudent(null)}>
              &times;
            </button>
          </h3>
          {detailLoading ? (
            <p>Loading detail...</p>
          ) : studentDetail ? (
            <StudentDetailTable
              data={studentDetail}
              formatDuration={formatDuration}
            />
          ) : (
            <p>No detail data available.</p>
          )}
        </div>
      )}
    </div>
  )
}

const AtRiskRow = ({
  student,
  onClick,
}: {
  student: StudentEntry
  onClick: (_id: string) => void
}) => (
  <tr style={styles.clickableRow} onClick={() => onClick(student.studentId)}>
    <td style={styles.td}>{student.identifier.slice(0, 12)}...</td>
    <td style={{ ...styles.td, textAlign: "center" }}>{student.totalSessions}</td>
    <td style={styles.td}>{new Date(student.lastSessionAt).toLocaleDateString()}</td>
  </tr>
)

const StudentRow = ({
  student,
  selected,
  onClick,
  formatDuration,
}: {
  student: StudentEntry
  selected: boolean
  onClick: (_id: string) => void
  formatDuration: (_ms: number) => string
}) => (
  <tr
    style={{
      ...styles.clickableRow,
      backgroundColor: selected ? "#e8f0fe" : "transparent",
    }}
    onClick={() => onClick(student.studentId)}
  >
    <td style={styles.td}>{student.identifier.slice(0, 12)}...</td>
    <td style={{ ...styles.td, textAlign: "center" }}>{student.totalSessions}</td>
    <td style={styles.td}>{formatDuration(student.avgDurationMs)}</td>
    <td style={styles.td}>{new Date(student.lastSessionAt).toLocaleDateString()}</td>
  </tr>
)

const StudentDetailTable = ({
  data,
  formatDuration,
}: {
  data: Record<string, unknown>
  formatDuration: (_ms: number) => string
}) => {
  const student = data.student as Record<string, unknown> | undefined
  const sessions = (data.sessions as Record<string, unknown>[]) || []
  const totalSessions = (data.totalSessions as number) || 0
  const totalDurationMs = (data.totalDurationMs as number) || 0
  const completionRate = (data.completionRate as number) || 0
  const uniqueSketches = (data.uniqueSketches as number) || 0

  const handleExport = () => {
    const headers = [
      "Date",
      "Sketch",
      "Board",
      "Duration (ms)",
      "Started",
      "Completed",
      "Errors",
    ]
    const rows = sessions.map((s, _i) => [
      new Date(s.startedAt as string).toLocaleString(),
      s.sketchName || "N/A",
      s.boardType || "N/A",
      String(s.durationMs ?? 0),
      String(s.simStarted),
      String(s.simCompleted),
      String(s.errorCount ?? 0),
    ])
    const csv = [headers, ...rows].map((r, _j) => r.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `student-${(student?.identifier as string)?.slice(0, 8) || "detail"}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div style={styles.statsRow}>
        <StatCard title="Sessions" value={totalSessions} color="#0066cc" />
        <StatCard
          title="Total Time"
          value={formatDuration(totalDurationMs)}
          color="#27ae60"
        />
        <StatCard
          title="Completion Rate"
          value={`${completionRate}%`}
          color="#8e44ad"
        />
        <StatCard title="Unique Sketches" value={uniqueSketches} color="#e67e22" />
      </div>
      <button style={styles.exportBtn} onClick={handleExport}>
        Export CSV
      </button>
      {sessions.length > 0 && (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Sketch</th>
              <th style={styles.th}>Board</th>
              <th style={styles.th}>Duration</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Errors</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((s, _i) => (
              <SessionRow
                key={s.id as string}
                session={s}
                formatDuration={formatDuration}
              />
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

const SessionRow = ({
  session,
  formatDuration,
}: {
  session: Record<string, unknown>
  formatDuration: (_ms: number) => string
}) => (
  <tr>
    <td style={styles.td}>
      {new Date(session.startedAt as string).toLocaleDateString()}
    </td>
    <td style={styles.td}>{(session.sketchName as string) || "N/A"}</td>
    <td style={styles.td}>{(session.boardType as string) || "N/A"}</td>
    <td style={styles.td}>
      {session.durationMs ? formatDuration(session.durationMs as number) : "N/A"}
    </td>
    <td style={styles.td}>
      {session.simCompleted
        ? "Completed"
        : session.simStarted
          ? "Started"
          : "Not started"}
    </td>
    <td style={{ ...styles.td, textAlign: "center" }}>{(session.errorCount as number) ?? 0}</td>
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
  clickableRow: {
    cursor: "pointer",
    transition: "background-color 0.15s",
  },
  detailPanel: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 20,
    marginTop: 16,
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
    border: "2px solid #0066cc",
  },
  detailTitle: {
    margin: "0 0 16px",
    fontSize: 16,
    color: "#333",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: 22,
    cursor: "pointer",
    color: "#666",
    lineHeight: 1,
  },
  exportBtn: {
    padding: "8px 16px",
    backgroundColor: "#27ae60",
    color: "#fff",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
    fontSize: 14,
    marginBottom: 16,
  },
}

export default StudentEngagementReport
