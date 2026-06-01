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
import { colors } from "../styles/colors"

const SkillsMasteryReport = () => {
  const { dateRange, setDateRange, fetchSkillsMastery } = useReports()
  const { data, loading, error, reload } = useReportData(fetchSkillsMastery, [
    dateRange,
  ])

  if (loading) return <LoadingState />
  if (error) return <ErrorDisplay message={error} onRetry={reload} />
  if (!data) return <p>No data available.</p>

  const masteryChartData = data.skills.map((s, _index) => ({
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
        <StatCard
          title="Total Skills"
          value={data.totalSkills}
          color={colors.primary}
        />
        <StatCard
          title="Avg Mastery"
          value={`${data.avgMasteryRate}%`}
          color={colors.success}
        />
        <StatCard
          title="Mastered"
          value={data.masteredSkills.length}
          color={colors.success}
        />
        <StatCard
          title="Struggling"
          value={data.strugglingSkills.length}
          color={colors.error}
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
              <Bar
                dataKey="masteryRate"
                fill={colors.success}
                name="Mastery Rate (%)"
              />
              <Bar dataKey="errorRate" fill={colors.error} name="Error Rate (%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {data.masteredSkills.length > 0 && (
        <div style={styles.chartContainer}>
          <h3 style={styles.chartTitle}>Mastered Skills (70%+)</h3>
          <div style={styles.skillCards}>
            {data.masteredSkills.map((s, _index) => (
              <div key={s.skill} style={styles.skillCard}>
                <h4 key={`${s.skill}-title`} style={styles.skillCardTitle}>
                  {s.skill}
                </h4>
                <p key={`${s.skill}-value`} style={styles.skillCardValue}>
                  {s.masteryRate}%
                </p>
                <p key={`${s.skill}-sub`} style={styles.skillCardSub}>
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
                {data.strugglingSkills.map((s, _index) => (
                  <tr key={s.skill}>
                    <td key={`${s.skill}-skill`} style={styles.td}>
                      {s.skill}
                    </td>
                    <td
                      key={`${s.skill}-mastery`}
                      style={{ ...styles.td, color: colors.error, fontWeight: 600 }}
                    >
                      {s.masteryRate}%
                    </td>
                    <td key={`${s.skill}-error`} style={styles.td}>
                      {s.errorRate}%
                    </td>
                    <td key={`${s.skill}-students`} style={styles.td}>
                      {s.uniqueStudents}
                    </td>
                    <td key={`${s.skill}-attempts`} style={styles.td}>
                      {s.totalAttempts}
                    </td>
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
              {data.skills.map((s, _index) => (
                <tr key={s.skill}>
                  <td key={`${s.skill}-skill`} style={styles.td}>
                    {s.skill}
                  </td>
                  <td key={`${s.skill}-mastery`} style={styles.td}>
                    {s.masteryRate}%
                  </td>
                  <td key={`${s.skill}-error`} style={styles.td}>
                    {s.errorRate}%
                  </td>
                  <td key={`${s.skill}-students`} style={styles.td}>
                    {s.uniqueStudents}
                  </td>
                  <td key={`${s.skill}-attempts`} style={styles.td}>
                    {s.totalAttempts}
                  </td>
                  <td key={`${s.skill}-completions`} style={styles.td}>
                    {s.completions}
                  </td>
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
    borderCollapse: "collapse",
    fontSize: 13,
  },
  th: {
    padding: "8px 12px",
    textAlign: "left",
    borderBottom: "2px solid #e0e0e0",
    fontWeight: 600,
    color: "#333",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "8px 12px",
    borderBottom: "1px solid #f0f0f0",
  },
}

export default SkillsMasteryReport
