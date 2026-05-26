import prisma from "../utils/db"
import { logger } from "../utils/logger"

interface DateRange {
  start?: string
  end?: string
}

function dateFilter(range?: DateRange): Record<string, unknown> {
  if (!range?.start && !range?.end) return {}
  const dateConditions: Record<string, Date> = {}
  if (range.start) dateConditions.gte = new Date(range.start)
  if (range.end) dateConditions.lte = new Date(range.end)
  return { startedAt: dateConditions }
}

export async function getStudents() {
  const students = await prisma.student.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      identifier: true,
      createdAt: true,
      _count: { select: { sessions: true } },
    },
  })

  return students.map((s) => ({
    id: s.id,
    identifier: s.identifier,
    createdAt: s.createdAt,
    sessionCount: s._count.sessions,
  }))
}

export async function getActivityReport(range?: DateRange) {
  const filter = dateFilter(range)

  const totalSessions = await prisma.session.count({ where: filter })

  const sessionsWithDuration = await prisma.session.findMany({
    where: filter,
    select: { durationMs: true },
  })

  const avgDuration =
    sessionsWithDuration.length > 0
      ? Math.round(
          sessionsWithDuration.reduce((sum, s) => sum + (s.durationMs || 0), 0) / sessionsWithDuration.length
        )
      : 0

  const topExamples = await prisma.session.groupBy({
    by: ["sketchName"],
    where: { sketchName: { not: null }, ...filter },
    _count: { sketchName: true },
    orderBy: { _count: { sketchName: "desc" } },
    take: 5,
  })

  // Use Prisma findMany instead of SQLite-specific raw SQL for portability
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const recentSessions = await prisma.session.findMany({
    where: { startedAt: { gte: thirtyDaysAgo } },
    select: { startedAt: true },
    orderBy: { startedAt: "asc" },
  })

  // Group by day in application code
  const dayMap = new Map<string, number>()
  for (const s of recentSessions) {
    const day = s.startedAt.toISOString().split("T")[0]
    dayMap.set(day, (dayMap.get(day) || 0) + 1)
  }
  const sessionsByDay = Array.from(dayMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, count]) => ({ day, count }))

  return {
    totalSessions,
    avgDurationMs: avgDuration,
    topExamples: topExamples.map((e) => ({
      name: e.sketchName || "Unknown",
      count: e._count.sketchName,
    })),
    sessionsByDay,
  }
}

export async function getPerformanceReport(range?: DateRange) {
  const filter = dateFilter(range)

  const totalSessions = await prisma.session.count({ where: filter })
  const simStarted = await prisma.session.count({ where: { simStarted: true, ...filter } })
  const simCompleted = await prisma.session.count({ where: { simCompleted: true, ...filter } })

  const errorEvents = await prisma.event.findMany({
    where: { type: "runtime_error", ...filter },
    select: { payload: true },
    take: 200,
  })

  const errorCounts: Record<string, number> = {}
  for (const e of errorEvents) {
    // payload is stored as JSON string, parse it to extract the error message
    if (e.payload) {
      try {
        const parsed = JSON.parse(e.payload) as { message?: string; error?: string }
        const key = parsed?.message || parsed?.error || e.payload.slice(0, 80)
        errorCounts[key] = (errorCounts[key] || 0) + 1
      } catch {
        const key = e.payload.slice(0, 80) || "unknown"
        errorCounts[key] = (errorCounts[key] || 0) + 1
      }
    } else {
      errorCounts["unknown"] = (errorCounts["unknown"] || 0) + 1
    }
  }

  // Use Prisma findMany instead of SQLite-specific raw SQL for portability
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const simStartEvents = await prisma.event.findMany({
    where: { type: "sim_start", timestamp: { gte: thirtyDaysAgo } },
    select: { timestamp: true },
    orderBy: { timestamp: "asc" },
  })

  // Group by day in application code
  const dayMap = new Map<string, number>()
  for (const e of simStartEvents) {
    const day = e.timestamp.toISOString().split("T")[0]
    dayMap.set(day, (dayMap.get(day) || 0) + 1)
  }
  const simAttemptsOverTime = Array.from(dayMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, count]) => ({ day, count }))

  return {
    totalSessions,
    simStartedCount: simStarted,
    simCompletedCount: simCompleted,
    successRate: totalSessions > 0 ? Math.round((simCompleted / totalSessions) * 100) : 0,
    topErrors: Object.entries(errorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([error, count]) => ({ error, count })),
    simAttemptsOverTime,
  }
}

export async function getProgressReport() {
  const examples = await prisma.session.groupBy({
    by: ["sketchName"],
    where: { sketchName: { not: null }, simCompleted: true },
    _count: { sketchName: true },
    orderBy: { _count: { sketchName: "desc" } },
  })

  const totalStudents = await prisma.student.count()

  return {
    examples: examples.map((e) => ({
      name: e.sketchName || "Unknown",
      completions: e._count.sketchName,
    })),
    totalStudents,
  }
}

export async function getPinUsageReport() {
  const digitalPinEvents = await prisma.event.findMany({
    where: { type: "digital_pin_change" },
    select: { payload: true },
  })

  const analogPinEvents = await prisma.event.findMany({
    where: { type: "analog_pin_change" },
    select: { payload: true },
  })

  const digitalPins: Record<number, number> = {}
  for (const e of digitalPinEvents) {
    if (e.payload) {
      try {
        const data = JSON.parse(e.payload) as { pin?: number }
        if (data.pin !== undefined) {
          digitalPins[data.pin] = (digitalPins[data.pin] || 0) + 1
        }
      } catch {
        // skip invalid payloads
      }
    }
  }

  const analogPins: Record<number, number> = {}
  for (const e of analogPinEvents) {
    if (e.payload) {
      try {
        const data = JSON.parse(e.payload) as { pin?: number }
        if (data.pin !== undefined) {
          analogPins[data.pin] = (analogPins[data.pin] || 0) + 1
        }
      } catch {
        // skip invalid payloads
      }
    }
  }

  return { digitalPins, analogPins }
}

export async function getSessions(page: number, limit: number, range?: DateRange) {
  const skip = (page - 1) * limit
  const where = dateFilter(range)

  const [sessions, total] = await Promise.all([
    prisma.session.findMany({
      where,
      skip,
      take: limit,
      orderBy: { startedAt: "desc" },
      include: { student: true },
    }),
    prisma.session.count({ where }),
  ])

  return { sessions, total, page, totalPages: Math.ceil(total / limit) }
}

export async function getStudentEngagementReport(range?: DateRange) {
  const filter = dateFilter(range)

  const sessions = await prisma.session.findMany({
    where: filter,
    select: {
      studentId: true,
      durationMs: true,
      startedAt: true,
      student: { select: { identifier: true, createdAt: true } },
    },
  })

  const studentMap = new Map<
    string,
    {
      identifier: string
      totalSessions: number
      totalDurationMs: number
      lastSessionAt: Date
    }
  >()

  for (const s of sessions) {
    const id = s.studentId
    if (!studentMap.has(id)) {
      studentMap.set(id, {
        identifier: s.student.identifier,
        totalSessions: 0,
        totalDurationMs: 0,
        lastSessionAt: new Date(0),
      })
    }
    const entry = studentMap.get(id)!
    entry.totalSessions++
    entry.totalDurationMs += s.durationMs || 0
    if (s.startedAt > entry.lastSessionAt) entry.lastSessionAt = s.startedAt
  }

  const students = Array.from(studentMap.entries())
    .map(([id, data]) => ({
      studentId: id,
      identifier: data.identifier,
      totalSessions: data.totalSessions,
      totalDurationMs: data.totalDurationMs,
      avgDurationMs:
        data.totalSessions > 0
          ? Math.round(data.totalDurationMs / data.totalSessions)
          : 0,
      lastSessionAt: data.lastSessionAt,
    }))
    .sort((a, b) => b.totalSessions - a.totalSessions)

  const heatmapByDay = new Array(7).fill(0)
  const heatmapByHour = new Array(24).fill(0)
  for (const s of sessions) {
    heatmapByDay[s.startedAt.getDay()]++
    heatmapByHour[s.startedAt.getHours()]++
  }

  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
  const atRiskStudents = students.filter((s) => s.lastSessionAt < fourteenDaysAgo)

  return {
    students: students.slice(0, 50),
    heatmapByDay: heatmapByDay.map((count, day) => ({
      day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][day],
      count,
    })),
    heatmapByHour: heatmapByHour.map((count, hour) => ({
      hour: `${hour}:00`,
      count,
    })),
    atRiskStudents: atRiskStudents.slice(0, 20),
    totalActiveStudents: students.length,
  }
}

export async function getSketchDifficultyReport(range?: DateRange) {
  const filter = dateFilter(range)

  const sketchStats = await prisma.session.groupBy({
    by: ["sketchName"],
    where: { sketchName: { not: null }, ...filter },
    _count: { id: true },
    _sum: { durationMs: true },
    orderBy: { _count: { id: "desc" } },
  })

  const sketchCompletions = await prisma.session.groupBy({
    by: ["sketchName"],
    where: { sketchName: { not: null }, simCompleted: true, ...filter },
    _count: { id: true },
  })
  const completionMap = new Map<string, number>()
  for (const s of sketchCompletions) {
    completionMap.set(s.sketchName || "", s._count.id)
  }

  const sessionsWithSketches = await prisma.session.findMany({
    where: { sketchName: { not: null }, ...filter },
    select: { id: true, sketchName: true },
  })

  const errorEvents = await prisma.event.findMany({
    where: { type: "runtime_error" },
    select: { sessionId: true },
  })
  const sessionIdsWithErrors = new Set(errorEvents.map((e) => e.sessionId))

  const sketchErrorMap = new Map<string, number>()
  for (const s of sessionsWithSketches) {
    if (sessionIdsWithErrors.has(s.id)) {
      const sketch = s.sketchName!
      sketchErrorMap.set(sketch, (sketchErrorMap.get(sketch) || 0) + 1)
    }
  }

  const sketches = sketchStats.map((stat) => {
    const name = stat.sketchName!
    const attempts = stat._count.id
    const completions = completionMap.get(name) || 0
    const errors = sketchErrorMap.get(name) || 0
    const avgDuration = stat._sum.durationMs
      ? Math.round(stat._sum.durationMs / attempts)
      : 0
    return {
      name,
      attempts,
      completions,
      completionRate: attempts > 0 ? Math.round((completions / attempts) * 100) : 0,
      avgDurationMs: avgDuration,
      errorCount: errors,
    }
  })

  const hardestSketch = sketches
    .filter((s) => s.attempts >= 3)
    .reduce(
      (hardest, s) =>
        s.completionRate < hardest.completionRate ? s : hardest,
      sketches[0] || { completionRate: 100 }
    )

  return {
    sketches,
    mostAttempted: sketches[0] || null,
    leastAttempted: sketches[sketches.length - 1] || null,
    hardestSketch,
  }
}

export async function getErrorTrendReport(range?: DateRange) {
  const filter = dateFilter(range)

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const errorEvents = await prisma.event.findMany({
    where: { type: "runtime_error", timestamp: { gte: thirtyDaysAgo } },
    select: { timestamp: true, payload: true, sessionId: true },
    orderBy: { timestamp: "asc" },
  })

  const dayMap = new Map<string, number>()
  const errorTypeMap: Record<string, number> = {}
  const sessionIdsWithErrors = new Set<string>()

  for (const e of errorEvents) {
    const day = e.timestamp.toISOString().split("T")[0]
    dayMap.set(day, (dayMap.get(day) || 0) + 1)
    sessionIdsWithErrors.add(e.sessionId)

    if (e.payload) {
      try {
        const parsed = JSON.parse(e.payload) as { message?: string; error?: string }
        const key = parsed?.message || parsed?.error || e.payload.slice(0, 80)
        const category = key.split(":")[0].split("(")[0].trim() || "unknown"
        errorTypeMap[category] = (errorTypeMap[category] || 0) + 1
      } catch {
        errorTypeMap["unknown"] = (errorTypeMap["unknown"] || 0) + 1
      }
    } else {
      errorTypeMap["unknown"] = (errorTypeMap["unknown"] || 0) + 1
    }
  }

  const errorTrend = Array.from(dayMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, count]) => ({ day, count }))

  const errorCategories = Object.entries(errorTypeMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([category, count]) => ({ category, count }))

  const sessions = await prisma.session.findMany({
    where: filter,
    select: { id: true, boardType: true },
  })

  const boardErrorMap: Record<string, number> = {}
  const boardTotalMap: Record<string, number> = {}
  for (const s of sessions) {
    const board = s.boardType || "Unknown"
    boardTotalMap[board] = (boardTotalMap[board] || 0) + 1
    if (sessionIdsWithErrors.has(s.id)) {
      boardErrorMap[board] = (boardErrorMap[board] || 0) + 1
    }
  }
  const errorsByBoard = Object.entries(boardTotalMap).map(([board, total]) => ({
    board,
    total,
    errors: boardErrorMap[board] || 0,
    errorRate: total > 0 ? Math.round(((boardErrorMap[board] || 0) / total) * 100) : 0,
  }))

  const sessionEndReasons = await prisma.session.findMany({
    where: { id: { in: Array.from(sessionIdsWithErrors) }, ...filter },
    select: { endReason: true, simCompleted: true },
  })
  const endedNormally = sessionEndReasons.filter(
    (s) => s.endReason === "user_stop" || s.simCompleted
  ).length
  const totalWithErrors = sessionEndReasons.length

  return {
    errorTrend,
    errorCategories,
    errorsByBoard,
    totalErrors: errorEvents.length,
    errorResolutionRate:
      totalWithErrors > 0 ? Math.round((endedNormally / totalWithErrors) * 100) : 0,
  }
}

export async function getBoardUsageReport(range?: DateRange) {
  const filter = dateFilter(range)

  const boardDistribution = await prisma.session.groupBy({
    by: ["boardType"],
    where: { boardType: { not: null }, ...filter },
    _count: { id: true },
    _sum: { durationMs: true },
    orderBy: { _count: { id: "desc" } },
  })

  const totalSessions = boardDistribution.reduce(
    (sum, b) => sum + b._count.id,
    0
  )

  const boardPerformance = boardDistribution.map((b) => {
    const board = b.boardType!
    return {
      board,
      sessions: b._count.id,
      percentage:
        totalSessions > 0 ? Math.round((b._count.id / totalSessions) * 100) : 0,
      avgDurationMs: b._sum.durationMs
        ? Math.round(b._sum.durationMs / b._count.id)
        : 0,
    }
  })

  const boardSketch = await prisma.session.groupBy({
    by: ["boardType", "sketchName"],
    where: {
      boardType: { not: null },
      sketchName: { not: null },
      ...filter,
    },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
  })

  const sketchBoardMap = new Map<string, { board: string; count: number }>()
  for (const bs of boardSketch) {
    const sketch = bs.sketchName!
    if (!sketchBoardMap.has(sketch)) {
      sketchBoardMap.set(sketch, { board: bs.boardType!, count: bs._count.id })
    }
  }
  const popularBoardPerSketch = Array.from(sketchBoardMap.entries())
    .map(([sketch, data]) => ({ sketch, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  return {
    boardPerformance,
    totalSessions,
    mostPopularBoard: boardPerformance[0]?.board || "N/A",
    popularBoardPerSketch,
  }
}

export async function getStudentDetail(studentId: string, range?: DateRange) {
  const filter = dateFilter(range)

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      sessions: {
        where: filter,
        orderBy: { startedAt: "desc" },
        include: {
          events: {
            where: { type: "runtime_error" },
            orderBy: { timestamp: "asc" },
          },
        },
      },
    },
  })

  if (!student) return null

  const totalDuration = student.sessions.reduce(
    (sum, s) => sum + (s.durationMs || 0),
    0
  )
  const completedCount = student.sessions.filter((s) => s.simCompleted).length
  const uniqueSketches = new Set(
    student.sessions.map((s) => s.sketchName).filter(Boolean)
  ).size

  return {
    student: {
      id: student.id,
      identifier: student.identifier,
      createdAt: student.createdAt,
    },
    sessions: student.sessions.map((s) => ({
      id: s.id,
      sketchName: s.sketchName,
      boardType: s.boardType,
      startedAt: s.startedAt,
      endedAt: s.endedAt,
      durationMs: s.durationMs,
      simStarted: s.simStarted,
      simCompleted: s.simCompleted,
      endReason: s.endReason,
      errorCount: s.events.length,
    })),
    totalSessions: student.sessions.length,
    totalDurationMs: totalDuration,
    completionRate:
      student.sessions.length > 0
        ? Math.round((completedCount / student.sessions.length) * 100)
        : 0,
    uniqueSketches,
  }
}

export async function getSessionEndReport(range?: DateRange) {
  const filter = dateFilter(range)

  const byReason = await prisma.session.groupBy({
    by: ["endReason"],
    where: { endReason: { not: null }, ...filter },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
  })

  const totalSessions = await prisma.session.count({ where: filter })
  const crashCount = await prisma.session.count({
    where: { endReason: "sim_crash", ...filter },
  })
  const incompleteCount = await prisma.session.count({
    where: { OR: [{ endedAt: null }, { durationMs: null }], ...filter },
  })
  const simCompleted = await prisma.session.count({
    where: { simCompleted: true, ...filter },
  })

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const recentSessions = await prisma.session.findMany({
    where: { startedAt: { gte: thirtyDaysAgo } },
    select: { startedAt: true, endReason: true },
    orderBy: { startedAt: "asc" },
  })

  const dayMap = new Map<
    string,
    { user_stop: number; sim_crash: number; page_unload: number; other: number }
  >()
  for (const s of recentSessions) {
    const day = s.startedAt.toISOString().split("T")[0]
    if (!dayMap.has(day)) {
      dayMap.set(day, { user_stop: 0, sim_crash: 0, page_unload: 0, other: 0 })
    }
    const entry = dayMap.get(day)!
    const reason = s.endReason
    if (reason === "user_stop") entry.user_stop++
    else if (reason === "sim_crash") entry.sim_crash++
    else if (reason === "page_unload") entry.page_unload++
    else entry.other++
  }

  const trendOverTime = Array.from(dayMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, counts]) => ({ day, ...counts }))

  return {
    totalSessions,
    byReason: byReason.map((r) => ({
      reason: r.endReason || "unknown",
      count: r._count.id,
    })),
    crashRate: totalSessions > 0 ? Math.round((crashCount / totalSessions) * 100) : 0,
    completionRate: totalSessions > 0 ? Math.round((simCompleted / totalSessions) * 100) : 0,
    abandonmentRate:
      totalSessions > 0 ? Math.round((incompleteCount / totalSessions) * 100) : 0,
    trendOverTime,
    incompleteCount,
  }
}

export async function getFileWorkflowReport(range?: DateRange) {
  const filter = dateFilter(range)
  const fileTypes = ["file_new", "file_open", "file_save", "file_example_load", "autosave"]

  const events = await prisma.event.findMany({
    where: { type: { in: fileTypes }, ...filter },
    select: { type: true, timestamp: true, sessionId: true },
    orderBy: { timestamp: "asc" },
  })

  const typeCounts: Record<string, number> = {}
  const dayMap = new Map<string, number>()
  const sessionSaves: Record<string, number> = {}

  for (const e of events) {
    typeCounts[e.type] = (typeCounts[e.type] || 0) + 1
    const day = e.timestamp.toISOString().split("T")[0]
    dayMap.set(day, (dayMap.get(day) || 0) + 1)
    if (e.type === "file_save") {
      sessionSaves[e.sessionId] = (sessionSaves[e.sessionId] || 0) + 1
    }
  }

  const byType = fileTypes.map((type) => ({
    type,
    count: typeCounts[type] || 0,
  }))

  const savesOverTime = Array.from(dayMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, count]) => ({ day, count }))

  const sessions = await prisma.session.findMany({
    where: { sketchName: { not: null }, ...filter },
    select: { id: true, sketchName: true },
  })
  const sketchSaveMap: Record<string, number> = {}
  for (const s of sessions) {
    if (sessionSaves[s.id]) {
      const name = s.sketchName!
      sketchSaveMap[name] = (sketchSaveMap[name] || 0) + sessionSaves[s.id]
    }
  }

  const topSketchesBySaves = Object.entries(sketchSaveMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([sketchName, saveCount]) => ({ sketchName, saveCount }))

  const uniqueSessions = new Set(events.map((e) => e.sessionId)).size
  const avgSavesPerSession =
    uniqueSessions > 0 ? Math.round((typeCounts["file_save"] || 0) / uniqueSessions * 10) / 10 : 0

  return {
    totalSaves: typeCounts["file_save"] || 0,
    totalOpens: typeCounts["file_open"] || 0,
    totalNewFiles: typeCounts["file_new"] || 0,
    totalExamplesLoaded: typeCounts["file_example_load"] || 0,
    totalAutosaves: typeCounts["autosave"] || 0,
    byType,
    savesOverTime,
    topSketchesBySaves,
    avgSavesPerSession,
  }
}

export async function getSerialUsageReport(range?: DateRange) {
  const filter = dateFilter(range)

  const events = await prisma.event.findMany({
    where: { type: { in: ["serial_output", "serial_send"] }, ...filter },
    select: { type: true, timestamp: true, sessionId: true },
    take: 5000,
    orderBy: { timestamp: "asc" },
  })

  const totalOutputs = events.filter((e) => e.type === "serial_output").length
  const totalSends = events.filter((e) => e.type === "serial_send").length

  const dayMap = new Map<string, { output: number; send: number }>()
  for (const e of events) {
    const day = e.timestamp.toISOString().split("T")[0]
    if (!dayMap.has(day)) dayMap.set(day, { output: 0, send: 0 })
    const entry = dayMap.get(day)!
    if (e.type === "serial_output") entry.output++
    else entry.send++
  }

  const serialOverTime = Array.from(dayMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, counts]) => ({ day, ...counts }))

  const sessions = await prisma.session.findMany({
    where: { sketchName: { not: null }, ...filter },
    select: { id: true, sketchName: true },
  })
  const sessionIdsWithSerial = new Set(events.map((e) => e.sessionId))
  const sketchSerialMap: Record<string, number> = {}
  for (const s of sessions) {
    if (sessionIdsWithSerial.has(s.id)) {
      const name = s.sketchName!
      sketchSerialMap[name] = (sketchSerialMap[name] || 0) + 1
    }
  }

  const topSketchesBySerial = Object.entries(sketchSerialMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([sketchName, count]) => ({ sketchName, count }))

  const uniqueSessions = new Set(events.map((e) => e.sessionId)).size
  const avgSerialPerSession =
    uniqueSessions > 0 ? Math.round((events.length / uniqueSessions) * 10) / 10 : 0
  const interactiveRatio =
    events.length > 0 ? Math.round((totalSends / events.length) * 100) : 0

  return {
    totalOutputs,
    totalSends,
    byType: [
      { type: "serial_output", count: totalOutputs },
      { type: "serial_send", count: totalSends },
    ],
    serialOverTime,
    topSketchesBySerial,
    avgSerialPerSession,
    interactiveRatio,
  }
}

export async function getStudentCohortReport(range?: DateRange) {
  const filter = dateFilter(range)

  const students = await prisma.student.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      sessions: {
        where: filter,
        select: { startedAt: true },
        orderBy: { startedAt: "asc" },
      },
    },
  })

  const totalStudents = students.length
  const returningStudents = students.filter((s) => s.sessions.length > 1).length
  const totalSessions = students.reduce((sum, s) => sum + s.sessions.length, 0)
  const avgSessionsPerStudent =
    totalStudents > 0 ? Math.round((totalSessions / totalStudents) * 10) / 10 : 0

  const cohortByWeek = new Map<string, number>()
  for (const s of students) {
    const created = s.createdAt
    const weekStart = new Date(created)
    weekStart.setDate(created.getDate() - created.getDay())
    const weekKey = weekStart.toISOString().split("T")[0]
    cohortByWeek.set(weekKey, (cohortByWeek.get(weekKey) || 0) + 1)
  }

  const cohortsByWeek = Array.from(cohortByWeek.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 12)
    .map(([week, studentCount]) => ({ week, studentCount }))

  const now = new Date()
  let returned7d = 0
  let returned14d = 0
  let returned30d = 0
  let newStudents = 0
  let returningStudentsCount = 0

  for (const s of students) {
    if (s.sessions.length === 0) continue
    const firstSession = s.sessions[0].startedAt
    const isNew =
      firstSession.getTime() - s.createdAt.getTime() < 7 * 24 * 60 * 60 * 1000
    if (isNew) newStudents++
    else returningStudentsCount++

    const lastSession = s.sessions[s.sessions.length - 1].startedAt
    const daysSinceLast =
      (now.getTime() - lastSession.getTime()) / (24 * 60 * 60 * 1000)
    if (daysSinceLast <= 7) returned7d++
    if (daysSinceLast <= 14) returned14d++
    if (daysSinceLast <= 30) returned30d++
  }

  const activeStudents = newStudents + returningStudentsCount
  const topStudents = students
    .filter((s) => s.sessions.length > 0)
    .sort((a, b) => b.sessions.length - a.sessions.length)
    .slice(0, 10)
    .map((s) => ({
      identifier: s.identifier,
      sessionCount: s.sessions.length,
      lastActive: s.sessions[s.sessions.length - 1].startedAt.toISOString(),
    }))

  return {
    totalStudents,
    returningStudentPct:
      activeStudents > 0
        ? Math.round((returningStudentsCount / activeStudents) * 100)
        : 0,
    avgSessionsPerStudent,
    cohortsByWeek,
    retentionData: {
      returned7d,
      returned14d,
      returned30d,
      activeStudents,
    },
    newVsReturning: { new: newStudents, returning: returningStudentsCount },
    topStudents,
  }
}

export async function getStudentScorecardReport(range?: DateRange) {
  const filter = dateFilter(range)

  const sessions = await prisma.session.findMany({
    where: filter,
    select: {
      studentId: true,
      sketchName: true,
      durationMs: true,
      simCompleted: true,
    },
  })

  const errorEvents = await prisma.event.findMany({
    where: { type: "runtime_error" },
    select: { sessionId: true },
  })
  const sessionErrorMap = new Map<string, number>()
  for (const e of errorEvents) {
    sessionErrorMap.set(e.sessionId, (sessionErrorMap.get(e.sessionId) || 0) + 1)
  }

  const studentMap = new Map<string, {
    identifier: string
    totalSessions: number
    completedSessions: number
    totalDurationMs: number
    totalErrors: number
    sketchesCompleted: Set<string>
  }>()

  for (const s of sessions) {
    const id = s.studentId
    if (!studentMap.has(id)) {
      studentMap.set(id, {
        identifier: "",
        totalSessions: 0,
        completedSessions: 0,
        totalDurationMs: 0,
        totalErrors: 0,
        sketchesCompleted: new Set(),
      })
    }
    const entry = studentMap.get(id)!
    entry.totalSessions++
    if (s.simCompleted) {
      entry.completedSessions++
      if (s.sketchName) entry.sketchesCompleted.add(s.sketchName)
    }
    entry.totalDurationMs += s.durationMs || 0
  }

  const students = await prisma.student.findMany({
    select: { id: true, identifier: true },
  })
  const idMap = new Map(students.map(s => [s.id, s.identifier]))

  const scorecards = Array.from(studentMap.entries()).map(([id, data]) => {
    const completionRate = data.totalSessions > 0 ? data.completedSessions / data.totalSessions : 0
    const avgDuration = data.totalSessions > 0 ? data.totalDurationMs / data.totalSessions : 0
    const errorRate = data.totalSessions > 0 ? data.totalErrors / data.totalSessions : 0
    const uniqueSketches = data.sketchesCompleted.size

    const score = Math.round(
      (completionRate * 40) +
      (Math.min(avgDuration / 600000, 1) * 20) +
      ((1 - Math.min(errorRate, 1)) * 20) +
      (Math.min(uniqueSketches / 10, 1) * 20)
    )

    let level = "Beginner"
    if (score >= 75) level = "Advanced"
    else if (score >= 50) level = "Intermediate"

    return {
      identifier: idMap.get(id) || id,
      studentId: id,
      totalSessions: data.totalSessions,
      completedSessions: data.completedSessions,
      completionRate: Math.round(completionRate * 100),
      avgDurationMs: Math.round(avgDuration),
      totalErrors: data.totalErrors,
      uniqueSketches,
      score,
      level,
    }
  }).sort((a, b) => b.score - a.score)

  const levelDistribution = [
    { level: "Beginner", count: scorecards.filter(s => s.level === "Beginner").length },
    { level: "Intermediate", count: scorecards.filter(s => s.level === "Intermediate").length },
    { level: "Advanced", count: scorecards.filter(s => s.level === "Advanced").length },
  ]

  return {
    scorecards: scorecards.slice(0, 50),
    levelDistribution,
    totalStudents: scorecards.length,
    avgScore: scorecards.length > 0
      ? Math.round(scorecards.reduce((sum, s) => sum + s.score, 0) / scorecards.length)
      : 0,
  }
}

export async function getLearningPathReport(range?: DateRange) {
  const filter = dateFilter(range)

  const sessions = await prisma.session.findMany({
    where: { sketchName: { not: null }, ...filter },
    select: {
      studentId: true,
      sketchName: true,
      startedAt: true,
      durationMs: true,
      simCompleted: true,
    },
    orderBy: { startedAt: "asc" },
  })

  const studentPaths = new Map<string, Array<{ sketch: string; completed: boolean; durationMs: number }>>()
  for (const s of sessions) {
    if (!s.sketchName) continue
    const studentSessions = studentPaths.get(s.studentId) || []
    studentSessions.push({
      sketch: s.sketchName,
      completed: s.simCompleted,
      durationMs: s.durationMs || 0,
    })
    studentPaths.set(s.studentId, studentSessions)
  }

  const transitions: Record<string, number> = {}
  for (const [, path] of studentPaths) {
    for (let i = 0; i < path.length - 1; i++) {
      const key = `${path[i].sketch} → ${path[i + 1].sketch}`
      transitions[key] = (transitions[key] || 0) + 1
    }
  }

  const popularPaths = Object.entries(transitions)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([path, count]) => ({ path, count }))

  const sketchStats = new Map<string, { attempts: number; completions: number; totalDurationMs: number; repeats: number }>()
  for (const [, path] of studentPaths) {
    const seen = new Map<string, number>()
    for (const step of path) {
      const stat = sketchStats.get(step.sketch) || { attempts: 0, completions: 0, totalDurationMs: 0, repeats: 0 }
      stat.attempts++
      if (step.completed) stat.completions++
      stat.totalDurationMs += step.durationMs
      const prevCount = seen.get(step.sketch) || 0
      if (prevCount > 0) stat.repeats++
      seen.set(step.sketch, prevCount + 1)
      sketchStats.set(step.sketch, stat)
    }
  }

  const sketchAnalysis = Array.from(sketchStats.entries())
    .map(([name, data]) => ({
      name,
      attempts: data.attempts,
      completions: data.completions,
      completionRate: data.attempts > 0 ? Math.round((data.completions / data.attempts) * 100) : 0,
      avgDurationMs: data.attempts > 0 ? Math.round(data.totalDurationMs / data.attempts) : 0,
      repeats: data.repeats,
    }))
    .sort((a, b) => b.repeats - a.repeats)

  const stuckSketches = sketchAnalysis.filter(s => s.repeats >= 2).slice(0, 10)

  return {
    popularPaths,
    sketchAnalysis,
    stuckSketches,
    totalPaths: Object.keys(transitions).length,
    totalStudents: studentPaths.size,
  }
}

export async function getErrorImpactReport(range?: DateRange) {
  const filter = dateFilter(range)

  const sessions = await prisma.session.findMany({
    where: filter,
    select: {
      id: true,
      studentId: true,
      sketchName: true,
      simCompleted: true,
      durationMs: true,
      endReason: true,
    },
  })

  const errorEvents = await prisma.event.findMany({
    where: { type: "runtime_error", ...filter },
    select: { sessionId: true, payload: true, timestamp: true },
    orderBy: { timestamp: "asc" },
  })

  const sessionErrorMap = new Map<string, { count: number; types: Record<string, number>; firstErrorTime?: Date }>()
  for (const e of errorEvents) {
    const entry = sessionErrorMap.get(e.sessionId) || { count: 0, types: {} }
    entry.count++
    if (!entry.firstErrorTime) entry.firstErrorTime = e.timestamp

    if (e.payload) {
      try {
        const parsed = JSON.parse(e.payload) as { message?: string; error?: string }
        const type = parsed?.message || parsed?.error || "unknown"
        entry.types[type] = (entry.types[type] || 0) + 1
      } catch {
        entry.types["unknown"] = (entry.types["unknown"] || 0) + 1
      }
    }
    sessionErrorMap.set(e.sessionId, entry)
  }

  const sessionData = sessions.map(s => ({
    id: s.id,
    studentId: s.studentId,
    sketchName: s.sketchName,
    simCompleted: s.simCompleted,
    durationMs: s.durationMs || 0,
    endReason: s.endReason,
    errorCount: sessionErrorMap.get(s.id)?.count || 0,
  }))

  const errorVsSuccess: { errors: number; completionRate: number }[] = []
  for (let i = 0; i <= 10; i++) {
    const bucket = sessionData.filter(s => s.errorCount === i)
    if (bucket.length > 0) {
      const rate = bucket.filter(s => s.simCompleted).length / bucket.length
      errorVsSuccess.push({ errors: i, completionRate: Math.round(rate * 100) })
    }
  }

  const toxicErrors: { errorType: string; abandonmentCount: number; totalCount: number }[] = []
  const errorTypeMap = new Map<string, { total: number; abandoned: number }>()
  for (const e of errorEvents) {
    let type = "unknown"
    if (e.payload) {
      try {
        const parsed = JSON.parse(e.payload) as { message?: string; error?: string }
        type = parsed?.message || parsed?.error || "unknown"
      } catch (parseError) {
        logger.warn("Failed to parse error event payload:", parseError)
      }
    }
    const entry = errorTypeMap.get(type) || { total: 0, abandoned: 0 }
    entry.total++
    const session = sessions.find(s => s.id === e.sessionId)
    if (session?.endReason === "page_unload" || session?.endReason === "sim_crash") {
      entry.abandoned++
    }
    errorTypeMap.set(type, entry)
  }

  for (const [type, data] of errorTypeMap) {
    toxicErrors.push({
      errorType: type,
      abandonmentCount: data.abandoned,
      totalCount: data.total,
    })
  }
  toxicErrors.sort((a, b) => b.abandonmentCount - a.abandonmentCount)

  const errorTrendByDay = new Map<string, number>()
  for (const e of errorEvents) {
    const day = e.timestamp.toISOString().split("T")[0]
    errorTrendByDay.set(day, (errorTrendByDay.get(day) || 0) + 1)
  }

  return {
    errorVsSuccess,
    toxicErrors: toxicErrors.slice(0, 10),
    errorTrendByDay: Array.from(errorTrendByDay.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([day, count]) => ({ day, count })),
    totalErrors: errorEvents.length,
    avgErrorsPerSession: sessions.length > 0
      ? Math.round((errorEvents.length / sessions.length) * 10) / 10
      : 0,
  }
}

export async function getComparativeReport(range?: DateRange) {
  const filter = dateFilter(range)

  const sessions = await prisma.session.findMany({
    where: filter,
    select: {
      id: true,
      studentId: true,
      boardType: true,
      sketchName: true,
      durationMs: true,
      simCompleted: true,
      startedAt: true,
    },
  })

  const errorEvents = await prisma.event.findMany({
    where: { type: "runtime_error" },
    select: { sessionId: true },
  })
  const sessionErrorSet = new Set(errorEvents.map(e => e.sessionId))

  const timeOfDayMap: Record<string, { count: number; completed: number; avgDurationMs: number }> = {
    morning: { count: 0, completed: 0, avgDurationMs: 0 },
    afternoon: { count: 0, completed: 0, avgDurationMs: 0 },
    evening: { count: 0, completed: 0, avgDurationMs: 0 },
    night: { count: 0, completed: 0, avgDurationMs: 0 },
  }
  let totalDurationMorning = 0, totalDurationAfternoon = 0, totalDurationEvening = 0, totalDurationNight = 0

  const dayOfWeekMap = new Map<string, { count: number; completed: number }>()
  const boardMap = new Map<string, { count: number; completed: number; errors: number }>()

  for (const s of sessions) {
    const hour = s.startedAt.getHours()
    const duration = s.durationMs || 0
    const hasError = sessionErrorSet.has(s.id)

    let period = "morning"
    if (hour >= 6 && hour < 12) {
      period = "morning"
      totalDurationMorning += duration
    } else if (hour >= 12 && hour < 18) {
      period = "afternoon"
      totalDurationAfternoon += duration
    } else if (hour >= 18 && hour < 22) {
      period = "evening"
      totalDurationEvening += duration
    } else {
      period = "night"
      totalDurationNight += duration
    }
    const periodData = timeOfDayMap[period]
    periodData.count++
    if (s.simCompleted) periodData.completed++
    periodData.avgDurationMs = periodData.count > 0
      ? Math.round(
          (period === "morning" ? totalDurationMorning :
           period === "afternoon" ? totalDurationAfternoon :
           period === "evening" ? totalDurationEvening : totalDurationNight) / periodData.count
        )
      : 0

    const dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][s.startedAt.getDay()]
    const dayData = dayOfWeekMap.get(dayName) || { count: 0, completed: 0 }
    dayData.count++
    if (s.simCompleted) dayData.completed++
    dayOfWeekMap.set(dayName, dayData)

    const board = s.boardType || "Unknown"
    const boardData = boardMap.get(board) || { count: 0, completed: 0, errors: 0 }
    boardData.count++
    if (s.simCompleted) boardData.completed++
    if (hasError) boardData.errors++
    boardMap.set(board, boardData)
  }

  const byTimeOfDay = Object.entries(timeOfDayMap).map(([period, data]) => ({
    period,
    sessions: data.count,
    completionRate: data.count > 0 ? Math.round((data.completed / data.count) * 100) : 0,
    avgDurationMs: data.avgDurationMs,
  }))

  const byDayOfWeek = Array.from(dayOfWeekMap.entries())
    .map(([day, data]) => ({
      day,
      sessions: data.count,
      completionRate: data.count > 0 ? Math.round((data.completed / data.count) * 100) : 0,
    }))
    .sort((a, b) => b.sessions - a.sessions)

  const byBoardType = Array.from(boardMap.entries())
    .map(([board, data]) => ({
      board,
      sessions: data.count,
      completionRate: data.count > 0 ? Math.round((data.completed / data.count) * 100) : 0,
      errorRate: data.count > 0 ? Math.round((data.errors / data.count) * 100) : 0,
    }))
    .sort((a, b) => b.sessions - a.sessions)

  const durations = sessions.map(s => s.durationMs || 0).sort((a, b) => a - b)
  const medianDuration = durations.length > 0
    ? durations[Math.floor(durations.length / 2)]
    : 0

  const fastStudents = sessions.filter(s => (s.durationMs || 0) < medianDuration)
  const slowStudents = sessions.filter(s => (s.durationMs || 0) >= medianDuration)

  return {
    byTimeOfDay,
    byDayOfWeek,
    byBoardType,
    fastVsSlow: {
      fast: {
        count: fastStudents.length,
        completionRate: fastStudents.length > 0
          ? Math.round((fastStudents.filter(s => s.simCompleted).length / fastStudents.length) * 100)
          : 0,
      },
      slow: {
        count: slowStudents.length,
        completionRate: slowStudents.length > 0
          ? Math.round((slowStudents.filter(s => s.simCompleted).length / slowStudents.length) * 100)
          : 0,
      },
    },
    medianDurationMs: medianDuration,
    totalSessions: sessions.length,
  }
}

export async function getSkillsMasteryReport(range?: DateRange) {
  const filter = dateFilter(range)

  const skillMap: Record<string, string[]> = {
    digital_output: ["blink", "button", "led_control", "traffic_light"],
    analog_input: ["analog_read", "potentiometer", "light_sensor", "temperature"],
    pwm: ["fade", "motor_speed", "brightness"],
    serial_communication: ["serial_print", "serial_read", "serial_monitor"],
    servo_control: ["servo", "sweep", "servo_potentiometer"],
    sensors: ["ultrasonic", "dht11", "ir_sensor", "piezo"],
    displays: ["lcd", "seven_segment", "led_matrix"],
    interrupts: ["interrupt", "encoder"],
  }

  const sessions = await prisma.session.findMany({
    where: { sketchName: { not: null }, ...filter },
    select: {
      id: true,
      studentId: true,
      sketchName: true,
      simCompleted: true,
      durationMs: true,
    },
  })

  const errorEvents = await prisma.event.findMany({
    where: { type: "runtime_error" },
    select: { sessionId: true },
  })
  const sessionErrorSet = new Set(errorEvents.map(e => e.sessionId))

  const skillData = new Map<string, {
    totalAttempts: number
    completions: number
    errors: number
    students: Set<string>
  }>()

  for (const [skill, sketches] of Object.entries(skillMap)) {
    const data = { totalAttempts: 0, completions: 0, errors: 0, students: new Set<string>() }
    for (const s of sessions) {
      if (!s.sketchName) continue
      const normalizedSketch = s.sketchName.toLowerCase().replace(/[_\s]/g, "_")
      if (sketches.some(sk => normalizedSketch.includes(sk.toLowerCase().replace(/[_\s]/g, "_")))) {
        data.totalAttempts++
        if (s.simCompleted) data.completions++
        if (sessionErrorSet.has(s.id)) data.errors++
        data.students.add(s.studentId)
      }
    }
    skillData.set(skill, data)
  }

  const skills = Array.from(skillData.entries())
    .map(([skill, data]) => ({
      skill: skill.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
      totalAttempts: data.totalAttempts,
      completions: data.completions,
      masteryRate: data.totalAttempts > 0 ? Math.round((data.completions / data.totalAttempts) * 100) : 0,
      errorRate: data.totalAttempts > 0 ? Math.round((data.errors / data.totalAttempts) * 100) : 0,
      uniqueStudents: data.students.size,
    }))
    .filter(s => s.totalAttempts > 0)
    .sort((a, b) => b.masteryRate - a.masteryRate)

  const masteredSkills = skills.filter(s => s.masteryRate >= 70)
  const strugglingSkills = skills.filter(s => s.masteryRate < 50)

  return {
    skills,
    totalSkills: skills.length,
    avgMasteryRate: skills.length > 0
      ? Math.round(skills.reduce((sum, s) => sum + s.masteryRate, 0) / skills.length)
      : 0,
    masteredSkills,
    strugglingSkills,
  }
}

export async function getBoardChangeReport(range?: DateRange) {
  const filter = dateFilter(range)

  const events = await prisma.event.findMany({
    where: { type: "board_change", ...filter },
    select: { payload: true, sessionId: true, timestamp: true },
  })

  const boardTypeCounts: Record<string, number> = {}
  const sessionSwitches: Record<string, number> = {}

  for (const e of events) {
    if (e.payload) {
      try {
        const data = JSON.parse(e.payload) as { boardType?: string }
        if (data.boardType) {
          boardTypeCounts[data.boardType] =
            (boardTypeCounts[data.boardType] || 0) + 1
        }
      } catch {
        // skip invalid payloads
      }
    }
    sessionSwitches[e.sessionId] = (sessionSwitches[e.sessionId] || 0) + 1
  }

  const byBoardType = Object.entries(boardTypeCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([boardType, count]) => ({ boardType, count }))

  const sessions = await prisma.session.findMany({
    where: { id: { in: Object.keys(sessionSwitches) } },
    select: {
      id: true,
      studentId: true,
      durationMs: true,
      student: { select: { identifier: true } },
    },
  })

  const studentData: Record<
    string,
    { identifier: string; switchCount: number; totalDurationMs: number; sessionCount: number }
  > = {}
  for (const s of sessions) {
    const sid = s.studentId
    if (!studentData[sid]) {
      studentData[sid] = {
        identifier: s.student.identifier,
        switchCount: 0,
        totalDurationMs: 0,
        sessionCount: 0,
      }
    }
    studentData[sid].switchCount += sessionSwitches[s.id] || 0
    studentData[sid].totalDurationMs += s.durationMs || 0
    studentData[sid].sessionCount++
  }

  const topSwitchers = Object.values(studentData)
    .sort((a, b) => b.switchCount - a.switchCount)
    .slice(0, 10)
    .map((d) => ({
      identifier: d.identifier,
      switchCount: d.switchCount,
      avgSessionDurationMs:
        d.sessionCount > 0
          ? Math.round(d.totalDurationMs / d.sessionCount)
          : 0,
    }))

  const allSwitchCounts = Object.values(studentData).map((d) => d.switchCount)
  const medianSwitches =
    allSwitchCounts.length > 0
      ? allSwitchCounts.sort((a, b) => a - b)[Math.floor(allSwitchCounts.length / 2)]
      : 0

  const highSwitchers = Object.values(studentData).filter(
    (d) => d.switchCount > medianSwitches
  )
  const lowSwitchers = Object.values(studentData).filter(
    (d) => d.switchCount <= medianSwitches
  )

  const avgDuration = (group: typeof highSwitchers) =>
    group.length > 0
      ? Math.round(
          group.reduce((sum, d) => sum + d.totalDurationMs, 0) /
            group.reduce((sum, d) => sum + d.sessionCount, 0) || 1
        )
      : 0

  return {
    totalBoardChanges: events.length,
    uniqueStudentsSwitching: Object.keys(studentData).length,
    byBoardType,
    topSwitchers,
    switchingVsDuration: {
      highSwitchers: {
        avgDurationMs: avgDuration(highSwitchers),
        avgSwitches:
          highSwitchers.length > 0
            ? Math.round(
                highSwitchers.reduce((sum, d) => sum + d.switchCount, 0) /
                  highSwitchers.length
              )
            : 0,
      },
      lowSwitchers: {
        avgDurationMs: avgDuration(lowSwitchers),
        avgSwitches:
          lowSwitchers.length > 0
            ? Math.round(
                lowSwitchers.reduce((sum, d) => sum + d.switchCount, 0) /
                  lowSwitchers.length
              )
            : 0,
      },
    },
  }
}
