import React from "react"
import {
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

interface ProgressData {
  totalStudents: number
  examples: { name: string; completions: number }[]
}

const ProgressReport = () => {
  const { fetchProgress } = useReports()
  const [data, setData] = React.useState<ProgressData | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const loadData = React.useCallback(() => {
    setLoading(true)
    setError(null)
    fetchProgress()
      .then((d) => {
        setData(d)
        setLoading(false)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load progress data")
        setLoading(false)
      })
  }, [fetchProgress])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  if (loading) return <p>Loading...</p>
  if (error) return <ErrorDisplay message={error} onRetry={loadData} />
  if (!data) return <p>No data available.</p>

  return (
    <div>
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
              <Bar dataKey="completions" fill="#27ae60" name="Completions" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      <div style={styles.grid}>
        {data.examples.map((ex, i) => (
          <div key={i} style={styles.card}>
            <h4 style={styles.cardTitle}>{ex.name}</h4>
            <p style={styles.cardValue}>{ex.completions} completions</p>
          </div>
        ))}
      </div>
    </div>
  )
}

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

export default ProgressReport
