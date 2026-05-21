import React from "react"
import { apiFetch } from "../utils/api"

export interface FilterState {
  dateRange: { start: string; end: string }
  studentId: string
  sketchName: string
  boardType: string
}

function buildParams(
  dateRange: { start: string; end: string },
  extra?: Record<string, string>
): string {
  const params = new URLSearchParams()
  if (dateRange.start) params.set("start", dateRange.start)
  if (dateRange.end) params.set("end", dateRange.end)
  if (extra) {
    for (const [key, value] of Object.entries(extra)) {
      if (value) params.set(key, value)
    }
  }
  return params.toString()
}

const STORAGE_KEY = "admin-filters"

function loadFilters(): FilterState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as FilterState
      return parsed
    }
  } catch {
    // ignore parse errors
  }
  return {
    dateRange: { start: "", end: "" },
    studentId: "",
    sketchName: "",
    boardType: "",
  }
}

function saveFilters(filters: FilterState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters))
  } catch {
    // ignore storage errors
  }
}

export function useReports() {
  const initial = React.useMemo(() => loadFilters(), [])
  const [dateRange, setDateRange] = React.useState(initial.dateRange)
  const [studentId, setStudentId] = React.useState(initial.studentId)
  const [sketchName, setSketchName] = React.useState(initial.sketchName)
  const [boardType, setBoardType] = React.useState(initial.boardType)

  const filters = React.useMemo(
    () => ({ dateRange, studentId, sketchName, boardType }),
    [dateRange, studentId, sketchName, boardType]
  )

  // Persist filters to localStorage
  React.useEffect(() => {
    saveFilters(filters)
  }, [filters])

  const setFilters = React.useCallback(
    (next: FilterState) => {
      setDateRange(next.dateRange)
      setStudentId(next.studentId)
      setSketchName(next.sketchName)
      setBoardType(next.boardType)
    },
    []
  )

  const clearFilters = React.useCallback(() => {
    const defaults: FilterState = {
      dateRange: { start: "", end: "" },
      studentId: "",
      sketchName: "",
      boardType: "",
    }
    setDateRange(defaults.dateRange)
    setStudentId(defaults.studentId)
    setSketchName(defaults.sketchName)
    setBoardType(defaults.boardType)
  }, [])

  const fetchActivity = React.useCallback(async () => {
    return apiFetch(`/api/admin/reports/activity?${buildParams(dateRange)}`)
  }, [dateRange])

  const fetchPerformance = React.useCallback(async () => {
    return apiFetch(`/api/admin/reports/performance?${buildParams(dateRange)}`)
  }, [dateRange])

  const fetchProgress = React.useCallback(async () => {
    return apiFetch("/api/admin/reports/progress")
  }, [])

  const fetchPinUsage = React.useCallback(async () => {
    return apiFetch("/api/admin/reports/pins")
  }, [])

  const fetchSessions = React.useCallback(
    async (page = 1, limit = 20) => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      })
      if (dateRange.start) params.set("start", dateRange.start)
      if (dateRange.end) params.set("end", dateRange.end)
      return apiFetch(`/api/admin/sessions?${params}`)
    },
    [dateRange]
  )

  const fetchStudents = React.useCallback(async () => {
    return apiFetch("/api/admin/students")
  }, [])

  const fetchStudentEngagement = React.useCallback(async () => {
    const extra = studentId ? { studentId } : undefined
    return apiFetch(
      `/api/admin/reports/student-engagement?${buildParams(dateRange, extra)}`
    )
  }, [dateRange, studentId])

  const fetchSketchDifficulty = React.useCallback(async () => {
    const extra = sketchName ? { sketchName } : undefined
    return apiFetch(
      `/api/admin/reports/sketch-difficulty?${buildParams(dateRange, extra)}`
    )
  }, [dateRange, sketchName])

  const fetchErrorTrends = React.useCallback(async () => {
    const extra = boardType ? { boardType } : undefined
    return apiFetch(
      `/api/admin/reports/error-trends?${buildParams(dateRange, extra)}`
    )
  }, [dateRange, boardType])

  const fetchBoardUsage = React.useCallback(async () => {
    const extra = boardType ? { boardType } : undefined
    return apiFetch(
      `/api/admin/reports/board-usage?${buildParams(dateRange, extra)}`
    )
  }, [dateRange, boardType])

  const fetchStudentDetail = React.useCallback(
    async (sid: string) => {
      const params = new URLSearchParams()
      if (dateRange.start) params.set("start", dateRange.start)
      if (dateRange.end) params.set("end", dateRange.end)
      return apiFetch(`/api/admin/students/${sid}?${params}`)
    },
    [dateRange]
  )

  const fetchSessionEnd = React.useCallback(async () => {
    const extra = boardType ? { boardType } : undefined
    return apiFetch(
      `/api/admin/reports/session-end?${buildParams(dateRange, extra)}`
    )
  }, [dateRange, boardType])

  const fetchFileWorkflow = React.useCallback(async () => {
    const extra = studentId ? { studentId } : undefined
    return apiFetch(
      `/api/admin/reports/file-workflow?${buildParams(dateRange, extra)}`
    )
  }, [dateRange, studentId])

  const fetchSerialUsage = React.useCallback(async () => {
    const extra = sketchName ? { sketchName } : undefined
    return apiFetch(
      `/api/admin/reports/serial-usage?${buildParams(dateRange, extra)}`
    )
  }, [dateRange, sketchName])

  const fetchStudentCohort = React.useCallback(async () => {
    return apiFetch(
      `/api/admin/reports/student-cohort?${buildParams(dateRange)}`
    )
  }, [dateRange])

  const fetchBoardChanges = React.useCallback(async () => {
    return apiFetch(
      `/api/admin/reports/board-changes?${buildParams(dateRange)}`
    )
  }, [dateRange])

  // New report fetch functions
  const fetchStudentScorecard = React.useCallback(async () => {
    const extra: Record<string, string> = {}
    if (studentId) extra.studentId = studentId
    if (sketchName) extra.sketchName = sketchName
    return apiFetch(
      `/api/admin/reports/student-scorecard?${buildParams(dateRange, extra)}`
    )
  }, [dateRange, studentId, sketchName])

  const fetchLearningPath = React.useCallback(async () => {
    const extra: Record<string, string> = {}
    if (studentId) extra.studentId = studentId
    if (sketchName) extra.sketchName = sketchName
    return apiFetch(
      `/api/admin/reports/learning-path?${buildParams(dateRange, extra)}`
    )
  }, [dateRange, studentId, sketchName])

  const fetchErrorImpact = React.useCallback(async () => {
    const extra: Record<string, string> = {}
    if (studentId) extra.studentId = studentId
    if (boardType) extra.boardType = boardType
    return apiFetch(
      `/api/admin/reports/error-impact?${buildParams(dateRange, extra)}`
    )
  }, [dateRange, studentId, boardType])

  const fetchComparative = React.useCallback(async () => {
    return apiFetch(
      `/api/admin/reports/comparative?${buildParams(dateRange)}`
    )
  }, [dateRange])

  const fetchSkillsMastery = React.useCallback(async () => {
    const extra: Record<string, string> = {}
    if (studentId) extra.studentId = studentId
    if (sketchName) extra.sketchName = sketchName
    return apiFetch(
      `/api/admin/reports/skills-mastery?${buildParams(dateRange, extra)}`
    )
  }, [dateRange, studentId, sketchName])

  return {
    dateRange,
    setDateRange,
    studentId,
    setStudentId,
    sketchName,
    setSketchName,
    boardType,
    setBoardType,
    filters,
    setFilters,
    fetchActivity,
    fetchPerformance,
    fetchProgress,
    fetchPinUsage,
    fetchSessions,
    fetchStudents,
    fetchStudentEngagement,
    fetchSketchDifficulty,
    fetchErrorTrends,
    fetchBoardUsage,
    fetchStudentDetail,
    fetchSessionEnd,
    fetchFileWorkflow,
    fetchSerialUsage,
    fetchStudentCohort,
    fetchBoardChanges,
    // New fetch functions
    fetchStudentScorecard,
    fetchLearningPath,
    fetchErrorImpact,
    fetchComparative,
    fetchSkillsMastery,
  }
}
