import React from "react"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
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

interface FileTypeEntry {
  type: string
  count: number
}

interface SavesOverTimeEntry {
  day: string
  count: number
}

interface SketchSaveEntry {
  sketchName: string
  saveCount: number
}

interface FileWorkflowData {
  totalSaves: number
  totalOpens: number
  totalNewFiles: number
  totalExamplesLoaded: number
  totalAutosaves: number
  byType: FileTypeEntry[]
  savesOverTime: SavesOverTimeEntry[]
  topSketchesBySaves: SketchSaveEntry[]
  avgSavesPerSession: number
}

const FileWorkflowReport = () => {
  const { dateRange, setDateRange, fetchFileWorkflow } = useReports()
  const [data, setData] = React.useState<FileWorkflowData | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const loadData = React.useCallback(() => {
    setLoading(true)
    setError(null)
    fetchFileWorkflow()
      .then((d) => {
        setData(d)
        setLoading(false)
      })
      .catch((err) => {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load file workflow data"
        )
        setLoading(false)
      })
  }, [fetchFileWorkflow])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  if (loading) return <LoadingState />
  if (error) return <ErrorDisplay message={error} onRetry={loadData} />
  if (!data) return <p>No data available.</p>

  return (
    <div>
      <div style={styles.headerRow}>
        <DateRangeFilter value={dateRange} onChange={setDateRange} />
        {data.byType.length > 0 && (
          <ExportButton data={data.byType} filename="file-workflow" />
        )}
      </div>
      <div style={styles.statsRow}>
        <StatCard
          title="Total Saves"
          value={data.totalSaves}
          color="#0066cc"
        />
        <StatCard
          title="Files Opened"
          value={data.totalOpens}
          color="#27ae60"
        />
        <StatCard
          title="New Files"
          value={data.totalNewFiles}
          color="#8e44ad"
        />
        <StatCard
          title="Avg Saves/Session"
          value={data.avgSavesPerSession}
          color="#f39c12"
        />
      </div>

      {data.byType.length > 0 && (
        <div style={styles.chartContainer}>
          <h3 style={styles.chartTitle}>File Events by Type</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.byType}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#0066cc" name="Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {data.savesOverTime.length > 0 && (
        <div style={styles.chartContainer}>
          <h3 style={styles.chartTitle}>Save Frequency Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.savesOverTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#0066cc" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {data.topSketchesBySaves.length > 0 && (
        <div style={styles.tableContainer}>
          <h3 style={styles.tableTitle}>Top Sketches by Save Count</h3>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Sketch</th>
                <th style={styles.th}>Saves</th>
              </tr>
            </thead>
            <tbody>
              {data.topSketchesBySaves.map((s) => (
                <SketchSaveRow
                  key={s.sketchName}
                  sketchName={s.sketchName}
                  saveCount={s.saveCount}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

const SketchSaveRow = ({
  sketchName,
  saveCount,
}: {
  sketchName: string
  saveCount: number
}) => (
  <tr>
    <td style={styles.td}>{sketchName}</td>
    <td style={{ ...styles.td, textAlign: "center" }}>{saveCount}</td>
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

export default FileWorkflowReport
