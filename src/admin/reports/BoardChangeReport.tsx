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

interface BoardTypeEntry {
  boardType: string
  count: number
}

interface SwitcherEntry {
  identifier: string
  switchCount: number
  avgSessionDurationMs: number
}

interface SwitchingVsDuration {
  highSwitchers: { avgDurationMs: number; avgSwitches: number }
  lowSwitchers: { avgDurationMs: number; avgSwitches: number }
}

interface BoardChangeData {
  totalBoardChanges: number
  uniqueStudentsSwitching: number
  byBoardType: BoardTypeEntry[]
  topSwitchers: SwitcherEntry[]
  switchingVsDuration: SwitchingVsDuration
}

const BoardChangeReport = () => {
  const { dateRange, setDateRange, fetchBoardChanges } = useReports()
  const { data, loading, error, reload } = useReportData(fetchBoardChanges, [dateRange])

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
        {data.topSwitchers.length > 0 && (
          <ExportButton data={data.topSwitchers} filename="board-changes" />
        )}
      </div>
      <div style={styles.statsRow}>
        <StatCard
          title="Total Board Changes"
          value={data.totalBoardChanges}
          color="#0066cc"
        />
        <StatCard
          title="Students Switching"
          value={data.uniqueStudentsSwitching}
          color="#27ae60"
        />
        <StatCard
          title="Board Types"
          value={data.byBoardType.length}
          color="#8e44ad"
        />
      </div>

      {data.byBoardType.length > 0 && (
        <div style={styles.chartContainer}>
          <h3 style={styles.chartTitle}>Board Changes by Type</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.byBoardType}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="boardType" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#0066cc" name="Changes" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div style={styles.comparisonContainer}>
        <h3 style={styles.tableTitle}>Switching vs Session Duration</h3>
        <div style={styles.comparisonGrid}>
          <div style={styles.comparisonCard}>
            <div style={styles.comparisonTitle}>High Switchers</div>
            <div style={styles.comparisonValue}>
              {formatDuration(data.switchingVsDuration.highSwitchers.avgDurationMs)}
            </div>
            <div style={styles.comparisonLabel}>Avg session duration</div>
            <div style={styles.comparisonSub}>
              {data.switchingVsDuration.highSwitchers.avgSwitches} switches avg
            </div>
          </div>
          <div style={styles.comparisonCard}>
            <div style={styles.comparisonTitle}>Low Switchers</div>
            <div style={styles.comparisonValue}>
              {formatDuration(data.switchingVsDuration.lowSwitchers.avgDurationMs)}
            </div>
            <div style={styles.comparisonLabel}>Avg session duration</div>
            <div style={styles.comparisonSub}>
              {data.switchingVsDuration.lowSwitchers.avgSwitches} switches avg
            </div>
          </div>
        </div>
      </div>

      {data.topSwitchers.length > 0 && (
        <div style={styles.tableContainer}>
          <h3 style={styles.tableTitle}>Top Board Switchers</h3>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Student</th>
                <th style={styles.th}>Switches</th>
                <th style={styles.th}>Avg Session</th>
              </tr>
            </thead>
            <tbody>
              {data.topSwitchers.map((s) => (
                <SwitcherRow
                  key={s.identifier}
                  identifier={s.identifier}
                  switchCount={s.switchCount}
                  avgDuration={formatDuration(s.avgSessionDurationMs)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

const SwitcherRow = ({
  identifier,
  switchCount,
  avgDuration,
}: {
  identifier: string
  switchCount: number
  avgDuration: string
}) => (
  <tr>
    <td style={styles.td}>{identifier}</td>
    <td style={{ ...styles.td, textAlign: "center" }}>{switchCount}</td>
    <td style={styles.td}>{avgDuration}</td>
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
  comparisonContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 20,
    marginBottom: 16,
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
  },
  comparisonGrid: {
    display: "flex",
    gap: 16,
    flexWrap: "wrap",
  },
  comparisonCard: {
    flex: 1,
    minWidth: 180,
    textAlign: "center",
    padding: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 6,
  },
  comparisonTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: "#333",
    marginBottom: 8,
  },
  comparisonValue: {
    fontSize: 24,
    fontWeight: 700,
    color: "#0066cc",
  },
  comparisonLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  comparisonSub: {
    fontSize: 11,
    color: "#999",
    marginTop: 2,
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

export default BoardChangeReport
