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
  LineChart,
  Line,
} from "recharts"
import StatCard from "../components/StatCard"
import ErrorDisplay from "../components/ErrorDisplay"
import LoadingState from "../components/LoadingState"
import ExportButton from "../components/ExportButton"
import { useReports } from "../hooks/useReports"
import { DateRangeFilter } from "../components/DateRangeFilter"

interface Skill {
  skill: string
  totalAttempts: number
  completions: number
  masteryRate: number
  errorRate: number
  uniqueStudents: number
}

interface SkillsMasteryData {
  skills: Skill[]
  totalSkills: number
  avgMasteryRate: number
  masteredSkills: Skill[]
  strugglingSkills: Skill[]
}

const SkillsMasteryReport = () => {
  const { dateRange, setDateRange, fetchSkillsMastery } = useReports()
  const [data, setData] = React.useState<SkillsMasteryData | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const loadData = React.useCallback(() => {
    setLoading(true)
    setError(null)
    fetchSkillsMastery()
      .then((d) => {
        setData(d as SkillsMasteryData | null)
        setLoading(false)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load skills mastery data")
        setLoading(false)
      })
  }, [fetchSkillsMastery])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  if (loading) return <LoadingState />
  if (error) return <ErrorDisplay message={error} onRetry={loadData} />
  if (!data) return <p>No data available.</p>

  const masteryChartData = data.skills.map((s) => ({
    skill: s.skill,
    masteryRate: s.masteryRate,
    errorRate: s.errorRate,
  }))

  return (
    <div>
      <div style={styles.headerRow}>
        <DateRangeFilter value={dateRange} onChange={setDateRange} />
        {data.skills.length > 0 && (
          <ExportButton data={data.skills} filename="skills-mastery" />
        )}
      </div>
      <div style={styles.statsRow}>
        <StatCard title="Total Skills" value={data.totalSkills} color="#0066cc" />
        <StatCard
          title="Avg Mastery"
          value={`${data.avgMasteryRate}%`}
          color="#27ae60"
        />
        <StatCard
          title="Mastered"
          value={data.masteredSkills.length}
          color="#27ae60"
        />
        <StatCard
          title="Struggling"
          value={data.strugglingSkills.length}
          color="#e74c3c"
        />
      </div>

      {masteryChartData.length > 0 && (
        <div style={styles.chartContainer}>
          <h3 style={styles.chartTitle}>Skills Mastery Overview</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={masteryChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="skill" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="masteryRate" fill="#27ae60" name="Mastery Rate (%)" />
              <Bar dataKey="errorRate" fill="#e74c3c" name="Error Rate (%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {data.masteredSkills.length > 0 && (
        <div style={styles.chartContainer}>
          <h3 style={styles.chartTitle}>Mastered Skills (70%+)</h3>
          <div style={styles.skillCards}>
            {data.masteredSkills.map((s) => (
              <div key={s.skill} style={styles.skillCard}>
                <h4 style={styles.skillCardTitle}>{s.skill}</h4>
                <p style={styles.skillCardValue}>{s.masteryRate}%</p>
                <p style={styles.skillCardSub}>
                  {s.uniqueStudents} students · {s.totalAttempts} attempts
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.strugglingSkills.length > 0 && (
        <div style={styles.chartContainer}>
          <h3 style={styles.chartTitle}>Struggling Skills (&lt;50%)</h3>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Skill</th>
                  <th style={styles.th}>Mastery Rate</th>
                  <th style={styles.th}>Error Rate</th>
                  <th style={styles.th}>Students</th>
                  <th style={styles.th}>Attempts</th>
                </tr>
              </thead>
              <tbody>
                {data.strugglingSkills.map((s) => (
                  <tr key={s.skill}>
                    <td style={styles.td}>{s.skill}</td>
                    <td style={{ ...styles.td, color: "#e74c3c", fontWeight: 600 }}>
                      {s.masteryRate}%
                    </td>
                    <td style={styles.td}>{s.errorRate}%</td>
                    <td style={styles.td}>{s.uniqueStudents}</td>
                    <td style={styles.td}>{s.totalAttempts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div style={styles.chartContainer}>
        <h3 style={styles.chartTitle}>All Skills Detail</h3>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Skill</th>
                <th style={styles.th}>Mastery Rate</th>
                <th style={styles.th}>Error Rate</th>
                <th style={styles.th}>Students</th>
                <th style={styles.th}>Attempts</th>
                <th style={styles.th}>Completions</th>
              </tr>
            </thead>
            <tbody>
              {data.skills.map((s) => (
                <tr key={s.skill}>
                  <td style={styles.td}>{s.skill}</td>
                  <td style={styles.td}>{s.masteryRate}%</td>
                  <td style={styles.td}>{s.errorRate}%</td>
                  <td style={styles.td}>{s.uniqueStudents}</td>
                  <td style={styles.td}>{s.totalAttempts}</td>
                  <td style={styles.td}>{s.completions}</td>
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
  skillCards: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
  },
  skillCard: {
    flex: 1,
    minWidth: 150,
    padding: 12,
    backgroundColor: "#f0f9f0",
    borderRadius: 8,
    border: "1px solid #c8e6c9",
  },
  skillCardTitle: {
    margin: "0 0 4px",
    fontSize: 13,
    color: "#333",
  },
  skillCardValue: {
    margin: "0 0 2px",
    fontSize: 20,
    fontWeight: 700,
    color: "#27ae60",
  },
  skillCardSub: {
    margin: 0,
    fontSize: 11,
    color: "#666",
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
}

export default SkillsMasteryReport
