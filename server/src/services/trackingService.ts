import prisma from "../utils/db"

export async function getOrCreateStudent(identifier: string) {
  return prisma.student.upsert({
    where: { identifier },
    create: { identifier },
    update: {},
  })
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
    data: { simStarted: true },
  })
}

export async function recordEvent(sessionId: string, type: string, payload?: string) {
  const updates: Record<string, unknown> = {}

  if (type === "sim_start") {
    updates.simStarted = true
  } else if (type === "sim_stop" || type === "sim_crash") {
    updates.simCompleted = true
  }

  const transactionOps: unknown[] = [
    prisma.event.create({
      data: { sessionId, type, payload },
    }),
  ]

  if (Object.keys(updates).length > 0) {
    transactionOps.push(
      prisma.session.update({ where: { id: sessionId }, data: updates }),
    )
  }

  return prisma.$transaction(transactionOps as any)
}
