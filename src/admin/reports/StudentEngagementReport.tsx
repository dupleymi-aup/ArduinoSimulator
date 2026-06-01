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
import { reportStyles } from "../styles/reportStyles"
import { formatDuration } from "../utils/formatDuration"

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
  const { data, loading, error, reload } = useReportData<StudentEngagementData>(
    (signal) => fetchStudentEngagement(signal),
    [dateRange]
  )
  const [selectedStudent, setSelectedStudent] = React.useState<string | null>(null)
  const [studentDetail, setStudentDetail] = React.useState<Record<
    string,
    unknown
  > | null>(null)
  const [detailLoading, setDetailLoading] = React.useState(false)
  const [detailError, setDetailError] = React.useState<string | null>(null)

  const handleStudentClick = React.useCallback(
    (studentId: string) => {
      setSelectedStudent(studentId)
      setDetailLoading(true)
      setStudentDetail(null)
      setDetailError(null)
      fetchStudentDetail(studentId)
        .then((d) => {
          setStudentDetail(d as Record<string, unknown> | null)
          setDetailLoading(false)
        })
        .catch((err) => {
          setDetailError(
            err instanceof Error ? err.message : "Failed to load student details"
          )
          setDetailLoading(false)
        })
    },
    [fetchStudentDetail]
  )

  if (loading) return <LoadingState />
  if (error) return <ErrorDisplay message={error} onRetry={reload} />
  if (!data) return <p>No data available.</p>

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
      <div style={reportStyles.headerRow}>
        <DateRangeFilter value={dateRange} onChange={setDateRange} />
        {data.students.length > 0 && (
          <ExportButton
            data={data.students as unknown as Record<string, unknown>[]}
            filename="student-engagement"
          />
        )}
      </div>
      <div style={reportStyles.statsRow}>
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
        <div style={reportStyles.chartContainer}>
          <h3 style={reportStyles.chartTitle}>Top Students by Sessions</h3>
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
        <div style={reportStyles.chartContainer}>
          <h3 style={reportStyles.chartTitle}>Activity by Day of Week</h3>
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
        <div style={reportStyles.chartContainer}>
          <h3 style={reportStyles.chartTitle}>Activity by Hour of Day</h3>
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
        <div style={reportStyles.tableContainer}>
          <h3 style={reportStyles.tableTitle}>
            At-Risk Students (No Activity &gt;14 Days)
          </h3>
          <table style={reportStyles.table}>
            <thead>
              <tr>
                <th style={reportStyles.th}>Student</th>
                <th style={reportStyles.th}>Sessions</th>
                <th style={reportStyles.th}>Last Active</th>
              </tr>
            </thead>
            <tbody>
              {data.atRiskStudents.map((s, index) => (
                <AtRiskRow
                  key={`${s.studentId}-${index}`}
                  student={s}
                  onClick={handleStudentClick}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={reportStyles.tableContainer}>
        <h3 style={reportStyles.tableTitle}>All Students (click for details)</h3>
        <table style={reportStyles.table}>
          <thead>
            <tr>
              <th style={reportStyles.th}>Student</th>
              <th style={reportStyles.th}>Sessions</th>
              <th style={reportStyles.th}>Avg Duration</th>
              <th style={reportStyles.th}>Last Active</th>
            </tr>
          </thead>
          <tbody>
            {data.students.map((s, index) => (
              <StudentRow
                key={`${s.studentId}-${index}`}
                student={s}
                selected={selectedStudent === s.studentId}
                onClick={handleStudentClick}
                formatDur={formatDuration}
              />
            ))}
          </tbody>
        </table>
      </div>

      {selectedStudent && (
        <div style={reportStyles.detailPanel}>
          <h3 style={reportStyles.detailTitle}>
            Student Detail{" "}
            <button
              style={reportStyles.closeBtn}
              onClick={() => setSelectedStudent(null)}
            >
              &times;
            </button>
          </h3>
          {detailLoading ? (
            <p>Loading detail...</p>
          ) : detailError ? (
            <p style={{ color: "#e74c3c" }}>{detailError}</p>
          ) : studentDetail ? (
            <StudentDetailTable data={studentDetail} formatDur={formatDuration} />
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
  <tr style={reportStyles.clickableRow} onClick={() => onClick(student.studentId)}>
    <td style={reportStyles.td}>{(student.identifier || "").slice(0, 12)}...</td>
    <td style={{ ...reportStyles.td, textAlign: "center" }}>
      {student.totalSessions}
    </td>
    <td style={reportStyles.td}>
      {new Date(student.lastSessionAt).toLocaleDateString()}
    </td>
  </tr>
)

const StudentRow = ({
  student,
  selected,
  onClick,
  formatDur,
}: {
  student: StudentEntry
  selected: boolean
  onClick: (_id: string) => void
  formatDur: (_ms: number) => string
}) => (
  <tr
    style={{
      ...reportStyles.clickableRow,
      backgroundColor: selected ? "#e8f0fe" : "transparent",
    }}
    onClick={() => onClick(student.studentId)}
  >
    <td style={reportStyles.td}>{(student.identifier || "").slice(0, 12)}...</td>
    <td style={{ ...reportStyles.td, textAlign: "center" }}>
      {student.totalSessions}
    </td>
    <td style={reportStyles.td}>{formatDur(student.avgDurationMs)}</td>
    <td style={reportStyles.td}>
      {new Date(student.lastSessionAt).toLocaleDateString()}
    </td>
  </tr>
)

const StudentDetailTable = ({
  data,
  formatDur,
}: {
  data: Record<string, unknown>
  formatDur: (_ms: number) => string
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
    const escapeCsv = (v: string) => {
      if (v.includes(",") || v.includes('"') || v.includes("\n")) {
        return `"${v.replace(/"/g, '""')}"`
      }
      return v
    }
    const rows = sessions.map((s, index) => [
      index,
      escapeCsv(new Date(s.startedAt as string).toLocaleString()),
      escapeCsv((s.sketchName as string) || "N/A"),
      escapeCsv((s.boardType as string) || "N/A"),
      String(s.durationMs ?? 0),
      String(s.simStarted),
      String(s.simCompleted),
      String(s.errorCount ?? 0),
    ])
    const csv = [headers, ...rows].map((r, _i) => r.join(",")).join("\n")
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
      <div style={reportStyles.statsRow}>
        <StatCard title="Sessions" value={totalSessions} color="#0066cc" />
        <StatCard
          title="Total Time"
          value={formatDur(totalDurationMs)}
          color="#27ae60"
        />
        <StatCard
          title="Completion Rate"
          value={`${completionRate}%`}
          color="#8e44ad"
        />
        <StatCard title="Unique Sketches" value={uniqueSketches} color="#e67e22" />
      </div>
      <button style={reportStyles.exportBtn} onClick={handleExport}>
        Export CSV
      </button>
      {sessions.length > 0 && (
        <table style={reportStyles.table}>
          <thead>
            <tr>
              <th style={reportStyles.th}>Date</th>
              <th style={reportStyles.th}>Sketch</th>
              <th style={reportStyles.th}>Board</th>
              <th style={reportStyles.th}>Duration</th>
              <th style={reportStyles.th}>Status</th>
              <th style={reportStyles.th}>Errors</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((s, index) => (
              <SessionRow
                key={`${(s.id as string) || index}`}
                session={s}
                formatDur={formatDur}
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
  formatDur,
}: {
  session: Record<string, unknown>
  formatDur: (_ms: number) => string
}) => (
  <tr>
    <td style={reportStyles.td}>
      {new Date(session.startedAt as string).toLocaleDateString()}
    </td>
    <td style={reportStyles.td}>{(session.sketchName as string) || "N/A"}</td>
    <td style={reportStyles.td}>{(session.boardType as string) || "N/A"}</td>
    <td style={reportStyles.td}>
      {session.durationMs ? formatDur(session.durationMs as number) : "N/A"}
    </td>
    <td style={reportStyles.td}>
      {session.simCompleted
        ? "Completed"
        : session.simStarted
          ? "Started"
          : "Not started"}
    </td>
    <td style={{ ...reportStyles.td, textAlign: "center" }}>
      {(session.errorCount as number) ?? 0}
    </td>
  </tr>
)

export default StudentEngagementReport
