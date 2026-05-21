import React from "react"
import AdminLayout from "./AdminLayout"
import ActivityReport from "./reports/ActivityReport"
import PerformanceReport from "./reports/PerformanceReport"
import ProgressReport from "./reports/ProgressReport"
import PinUsageReport from "./reports/PinUsageReport"
import StudentEngagementReport from "./reports/StudentEngagementReport"
import SketchDifficultyReport from "./reports/SketchDifficultyReport"
import ErrorTrendReport from "./reports/ErrorTrendReport"
import BoardUsageReport from "./reports/BoardUsageReport"
import SessionEndReport from "./reports/SessionEndReport"
import FileWorkflowReport from "./reports/FileWorkflowReport"
import SerialUsageReport from "./reports/SerialUsageReport"
import StudentCohortReport from "./reports/StudentCohortReport"
import BoardChangeReport from "./reports/BoardChangeReport"
import StudentScorecardReport from "./reports/StudentScorecardReport"
import LearningPathReport from "./reports/LearningPathReport"
import ErrorImpactReport from "./reports/ErrorImpactReport"
import ComparativeReport from "./reports/ComparativeReport"
import SkillsMasteryReport from "./reports/SkillsMasteryReport"
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts"

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

const AdminDashboard = ({ onLogout }: { onLogout: () => void }) => {
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
      <ReportComponent />
      {HelpModal}
    </AdminLayout>
  )
}

export default AdminDashboard
