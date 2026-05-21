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

interface ProgressData {
  totalStudents: number
  examples: { name: string; completions: number }[]
}

const ProgressReport = () => {
  const { fetchProgress } = useReports()
  const { data, loading, error, reload } = useReportData(fetchProgress)

  if (loading) return <LoadingState />
  if (error) return <ErrorDisplay message={error} onRetry={reload} />
  if (!data) return <p>No data available.</p>

  return (
    <div>
      <div style={styles.headerRow}>
        <h2 style={styles.pageTitle}>Progress Report</h2>
        {data.examples.length > 0 && (
          <ExportButton data={data.examples} filename="progress-examples" />
        )}
      </div>
      <div style={styles.statsRow}>
        <StatCard
          title="Total Students"
          value={data.totalStudents}
          color="#0066cc"
        />
        <StatCard
          title="Examples Completed"
          value={data.examples.length}
          color="#27ae60"
        />
      </div>
      {data.examples.length > 0 && (
        <div style={styles.chartContainer}>
          <h3 style={styles.chartTitle}>Example Completion Count</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.examples}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="completions" fill="#27ae60" name="Completions" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      <div style={styles.grid}>
        {data.examples.map((ex, _i) => (
          <ExampleCard key={ex.name} name={ex.name} completions={ex.completions} />
        ))}
      </div>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    flexWrap: "wrap",
    gap: 12,
  },
  pageTitle: {
    margin: 0,
    fontSize: 20,
    fontWeight: 600,
    color: "#333",
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
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: 12,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
  },
  cardTitle: {
    margin: "0 0 8px",
    fontSize: 14,
    color: "#333",
  },
  cardValue: {
    margin: 0,
    fontSize: 22,
    fontWeight: 700,
    color: "#27ae60",
  },
}

const ExampleCard = ({
  name,
  completions,
}: {
  name: string
  completions: number
}) => (
  <div style={styles.card}>
    <h4 style={styles.cardTitle}>{name}</h4>
    <p style={styles.cardValue}>{completions} completions</p>
  </div>
)

export default ProgressReport
