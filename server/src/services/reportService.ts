import prisma from "../utils/db"

interface DateRange {
  start?: string
  end?: string
}

function dateFilter(range?: DateRange) {
  if (!range?.start && !range?.end) return {}
  const where: Record<string, unknown> = {}
  if (range.start) where.gte = new Date(range.start)
  if (range.end) where.lte = new Date(range.end)
  return where
}

export async function getActivityReport(range?: DateRange) {
  const filter = dateFilter(range)

  const totalSessions = await prisma.session.count({ where: filter.startedAt ? { startedAt: filter } : {} })

  const sessionsWithDuration = await prisma.session.findMany({
    where: filter.startedAt ? { startedAt: filter } : {},
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
    where: { ...filter, sketchName: { not: null } },
    _count: { sketchName: true },
    orderBy: { _count: { sketchName: "desc" } },
    take: 5,
  })

  const sessionsByDay = await prisma.$queryRaw`
    SELECT date(startedAt) as day, count(*) as count
    FROM Session
    WHERE startedAt >= datetime('now', '-30 days')
    GROUP BY day
    ORDER BY day
  `

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
  const baseWhere = filter.startedAt ? { startedAt: filter } : {}

  const totalSessions = await prisma.session.count({ where: baseWhere })
  const simStarted = await prisma.session.count({ where: { ...baseWhere, simStarted: true } })
  const simCompleted = await prisma.session.count({ where: { ...baseWhere, simCompleted: true } })

  const errorEvents = await prisma.event.findMany({
    where: { type: "runtime_error" },
    select: { payload: true },
    take: 200,
  })

  const errorCounts: Record<string, number> = {}
  for (const e of errorEvents) {
    const key = e.payload || "unknown"
    errorCounts[key] = (errorCounts[key] || 0) + 1
  }

  const simAttemptsOverTime = await prisma.$queryRaw`
    SELECT date(timestamp) as day, count(*) as count
    FROM Event
    WHERE type = 'sim_start'
    AND timestamp >= datetime('now', '-30 days')
    GROUP BY day
    ORDER BY day
  `

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
  const filter = dateFilter(range)
  const where = filter.startedAt ? { startedAt: filter } : {}

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
