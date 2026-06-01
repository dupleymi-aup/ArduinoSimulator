import React from "react"

const ActivityReport = React.lazy(() => import("../reports/ActivityReport"))
const PerformanceReport = React.lazy(() => import("../reports/PerformanceReport"))
const ProgressReport = React.lazy(() => import("../reports/ProgressReport"))
const PinUsageReport = React.lazy(() => import("../reports/PinUsageReport"))
const StudentEngagementReport = React.lazy(() => import("../reports/StudentEngagementReport"))
const SketchDifficultyReport = React.lazy(() => import("../reports/SketchDifficultyReport"))
const ErrorTrendReport = React.lazy(() => import("../reports/ErrorTrendReport"))
const BoardUsageReport = React.lazy(() => import("../reports/BoardUsageReport"))
const SessionEndReport = React.lazy(() => import("../reports/SessionEndReport"))
const FileWorkflowReport = React.lazy(() => import("../reports/FileWorkflowReport"))
const SerialUsageReport = React.lazy(() => import("../reports/SerialUsageReport"))
const StudentCohortReport = React.lazy(() => import("../reports/StudentCohortReport"))
const BoardChangeReport = React.lazy(() => import("../reports/BoardChangeReport"))
const StudentScorecardReport = React.lazy(() => import("../reports/StudentScorecardReport"))
const LearningPathReport = React.lazy(() => import("../reports/LearningPathReport"))
const ErrorImpactReport = React.lazy(() => import("../reports/ErrorImpactReport"))
const ComparativeReport = React.lazy(() => import("../reports/ComparativeReport"))
const SkillsMasteryReport = React.lazy(() => import("../reports/SkillsMasteryReport"))

/**
 * Single source of truth for admin report tabs.
 * TAB_MAP maps tab names to their lazy-loaded components.
 * TAB_NAMES is derived as the ordered list of tab names.
 */
export const TAB_MAP: Record<string, React.ComponentType> = {
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

export const TAB_NAMES = Object.keys(TAB_MAP)
