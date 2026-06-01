import React from "react"
import AdminLayout from "./AdminLayout"
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts"
import { useAuth } from "./hooks/useAuth"

const ActivityReport = React.lazy(() => import("./reports/ActivityReport"))
const PerformanceReport = React.lazy(() => import("./reports/PerformanceReport"))
const ProgressReport = React.lazy(() => import("./reports/ProgressReport"))
const PinUsageReport = React.lazy(() => import("./reports/PinUsageReport"))
const StudentEngagementReport = React.lazy(() => import("./reports/StudentEngagementReport"))
const SketchDifficultyReport = React.lazy(() => import("./reports/SketchDifficultyReport"))
const ErrorTrendReport = React.lazy(() => import("./reports/ErrorTrendReport"))
const BoardUsageReport = React.lazy(() => import("./reports/BoardUsageReport"))
const SessionEndReport = React.lazy(() => import("./reports/SessionEndReport"))
const FileWorkflowReport = React.lazy(() => import("./reports/FileWorkflowReport"))
const SerialUsageReport = React.lazy(() => import("./reports/SerialUsageReport"))
const StudentCohortReport = React.lazy(() => import("./reports/StudentCohortReport"))
const BoardChangeReport = React.lazy(() => import("./reports/BoardChangeReport"))
const StudentScorecardReport = React.lazy(() => import("./reports/StudentScorecardReport"))
const LearningPathReport = React.lazy(() => import("./reports/LearningPathReport"))
const ErrorImpactReport = React.lazy(() => import("./reports/ErrorImpactReport"))
const ComparativeReport = React.lazy(() => import("./reports/ComparativeReport"))
const SkillsMasteryReport = React.lazy(() => import("./reports/SkillsMasteryReport"))

const TAB_MAP: Record<string, React.ComponentType> = {
  Activity: ActivityReport,
  Performance: PerformanceReport,
  Progress: ProgressReport,
  "Pin Usage": PinUsageReport,
  "Student Engagement": StudentEngagementReport,
  "Sketch Difficulty": SketchDifficultyReport,
  "Error Trends": ErrorTrendReport,
  "Board Usage": BoardUsageReport,
  "Session End": SessionEndReport,
  "File Workflow": FileWorkflowReport,
  "Serial Usage": SerialUsageReport,
  "Student Cohort": StudentCohortReport,
  "Board Changes": BoardChangeReport,
  "Student Scorecard": StudentScorecardReport,
  "Learning Path": LearningPathReport,
  "Error Impact": ErrorImpactReport,
  "Comparative": ComparativeReport,
  "Skills Mastery": SkillsMasteryReport,
}

const TAB_NAMES = Object.keys(TAB_MAP)

const styles: { [key: string]: React.CSSProperties } = {
  tokenWarning: {
    backgroundColor: "#fef3c7",
    border: "1px solid #f59e0b",
    color: "#92400e",
    padding: "10px 16px",
    borderRadius: "4px",
    margin: "12px 16px",
    fontSize: "14px",
    textAlign: "center",
  },
}

const AdminDashboard = ({ onLogout }: { onLogout: () => void }) => {
  const { tokenExpiringSoon } = useAuth()
  const [activeTab, setActiveTab] = React.useState("Activity")
  const ReportComponent = TAB_MAP[activeTab] || ActivityReport
  const { HelpModal } = useKeyboardShortcuts({
    tabNames: TAB_NAMES,
    onTabChange: setActiveTab,
    onLogout,
  })

  return (
    <AdminLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onLogout={onLogout}
    >
      {tokenExpiringSoon && (
        <div style={styles.tokenWarning}>
          Your session will expire soon. Please save your work and log in again if needed.
        </div>
      )}
      <React.Suspense fallback={<div style={{ padding: "2rem", textAlign: "center" }}>Loading report...</div>}>
        <ReportComponent />
      </React.Suspense>
      {HelpModal && <HelpModal />}
    </AdminLayout>
  )
}

export default AdminDashboard
