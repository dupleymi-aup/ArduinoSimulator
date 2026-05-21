import prisma from "../utils/db"

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
