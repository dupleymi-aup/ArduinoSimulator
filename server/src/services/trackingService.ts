import prisma from "../utils/db"

export async function getOrCreateStudent(identifier: string) {
  let student = await prisma.student.findUnique({ where: { identifier } })
  if (!student) {
    student = await prisma.student.create({ data: { identifier } })
  }
  return student
}

export async function startSession(studentId: string, sketchName?: string, boardType?: string) {
  return prisma.session.create({
    data: { studentId, sketchName, boardType },
  })
}

export async function endSession(sessionId: string, durationMs: number, endReason: string) {
  return prisma.session.update({
    where: { id: sessionId },
    data: { endedAt: new Date(), durationMs, endReason },
  })
}

export async function heartbeatSession(sessionId: string) {
  return prisma.session.update({
    where: { id: sessionId },
    data: { updatedAt: new Date() },
  })
}

export async function recordEvent(sessionId: string, type: string, payload?: object) {
  const updates: Record<string, unknown> = {}

  if (type === "sim_start") {
    updates.simStarted = true
  } else if (type === "sim_stop" || type === "sim_crash") {
    updates.simCompleted = true
  }

  return prisma.$transaction([
    prisma.event.create({
      data: { sessionId, type, payload: payload ? JSON.stringify(payload) : undefined },
    }),
    Object.keys(updates).length > 0
      ? prisma.session.update({ where: { id: sessionId }, data: updates })
      : Promise.resolve(),
  ])
}
