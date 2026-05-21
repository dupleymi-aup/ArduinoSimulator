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

const TAB_MAP: Record<string, React.ComponentType> = {
  Activity: ActivityReport,
  Performance: PerformanceReport,
  Progress: ProgressReport,
  "Pin Usage": PinUsageReport,
  "Student Engagement": StudentEngagementReport,
  "Sketch Difficulty": SketchDifficultyReport,
  "Error Trends": ErrorTrendReport,
  "Board Usage": BoardUsageReport,
}

const AdminDashboard = ({ onLogout }: { onLogout: () => void }) => {
  const [activeTab, setActiveTab] = React.useState("Activity")
  const ReportComponent = TAB_MAP[activeTab] || ActivityReport

  return (
    <AdminLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onLogout={onLogout}
    >
      <ReportComponent />
    </AdminLayout>
  )
}

export default AdminDashboard
