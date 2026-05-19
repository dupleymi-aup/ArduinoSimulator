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

export async function getStudents() {
  const students = await prisma.student.findMany({
    include: {
      _count: { select: { sessions: true } },
      sessions: {
        select: { durationMs: true, simCompleted: true, simStarted: true },
        orderBy: { startedAt: "desc" },
        take: 1,
      },
    },
  })

  return students.map((s) => ({
    ...s,
    totalSessions: s._count.sessions,
    lastSession: s.sessions[0] || null,
  }))
}
