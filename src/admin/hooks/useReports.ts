import React from "react"
import { apiFetch } from "../utils/api"

export function useReports() {
  const [dateRange, setDateRange] = React.useState({ start: "", end: "" })

  const fetchActivity = React.useCallback(async () => {
    const params = new URLSearchParams()
    if (dateRange.start) params.set("start", dateRange.start)
    if (dateRange.end) params.set("end", dateRange.end)
    return apiFetch(`/api/admin/reports/activity?${params}`)
  }, [dateRange])

  const fetchPerformance = React.useCallback(async () => {
    const params = new URLSearchParams()
    if (dateRange.start) params.set("start", dateRange.start)
    if (dateRange.end) params.set("end", dateRange.end)
    return apiFetch(`/api/admin/reports/performance?${params}`)
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
    const params = new URLSearchParams()
    if (dateRange.start) params.set("start", dateRange.start)
    if (dateRange.end) params.set("end", dateRange.end)
    return apiFetch(`/api/admin/reports/student-engagement?${params}`)
  }, [dateRange])

  const fetchSketchDifficulty = React.useCallback(async () => {
    const params = new URLSearchParams()
    if (dateRange.start) params.set("start", dateRange.start)
    if (dateRange.end) params.set("end", dateRange.end)
    return apiFetch(`/api/admin/reports/sketch-difficulty?${params}`)
  }, [dateRange])

  const fetchErrorTrends = React.useCallback(async () => {
    const params = new URLSearchParams()
    if (dateRange.start) params.set("start", dateRange.start)
    if (dateRange.end) params.set("end", dateRange.end)
    return apiFetch(`/api/admin/reports/error-trends?${params}`)
  }, [dateRange])

  const fetchBoardUsage = React.useCallback(async () => {
    const params = new URLSearchParams()
    if (dateRange.start) params.set("start", dateRange.start)
    if (dateRange.end) params.set("end", dateRange.end)
    return apiFetch(`/api/admin/reports/board-usage?${params}`)
  }, [dateRange])

  const fetchStudentDetail = React.useCallback(
    async (studentId: string) => {
      const params = new URLSearchParams()
      if (dateRange.start) params.set("start", dateRange.start)
      if (dateRange.end) params.set("end", dateRange.end)
      return apiFetch(`/api/admin/students/${studentId}?${params}`)
    },
    [dateRange]
  )

  return {
    dateRange,
    setDateRange,
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
  }
}
