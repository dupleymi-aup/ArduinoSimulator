import { Router } from "express"
import rateLimit from "express-rate-limit"
import { logger } from "../utils/logger"
import { getOrCreateStudent, startSession, endSession, heartbeatSession, recordEvent } from "../services/trackingService"

const router = Router()

// Rate limiter for session and event operations (user actions)
const trackingLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later" },
})

// Separate, more permissive rate limiter for heartbeats
const heartbeatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300, // Allow 5 heartbeats/second over 60s window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many heartbeat requests, please try again later" },
})

const sanitizeString = (value: unknown, maxLength = 500): string | undefined => {
  if (typeof value !== "string") return undefined
  const trimmed = value.trim().slice(0, maxLength)
  return trimmed.replace(/[<>]/g, "")
}

router.post("/session/start", trackingLimiter, async (req, res) => {
  try {
    const { studentId, sketchName, boardType } = req.body
    if (!studentId) {
      return res.status(400).json({ error: "studentId is required" })
    }

    const sanitizedStudentId = sanitizeString(studentId, 100)
    const sanitizedSketchName = sanitizeString(sketchName, 200)
    const sanitizedBoardType = sanitizeString(boardType, 50)

    if (!sanitizedStudentId) {
      return res.status(400).json({ error: "Invalid studentId format" })
    }

    const student = await getOrCreateStudent(sanitizedStudentId)
    const session = await startSession(student.id, sanitizedSketchName, sanitizedBoardType)
    res.json({ sessionId: session.id })
  } catch (err) {
    logger.error("Error starting session:", err)
    res.status(500).json({ error: "Failed to start session" })
  }
})

router.post("/event", trackingLimiter, async (req, res) => {
  try {
    const { sessionId, type, payload } = req.body
    if (!sessionId || !type) {
      return res.status(400).json({ error: "sessionId and type are required" })
    }

    const sanitizedType = sanitizeString(type, 100)

    let sanitizedPayload: string | undefined
    if (typeof payload === "string") {
      sanitizedPayload = sanitizeString(payload, 2000)
    } else if (payload && typeof payload === "object") {
      sanitizedPayload = JSON.stringify(payload).slice(0, 2000)
    }

    if (!sanitizedType) {
      return res.status(400).json({ error: "Invalid event type format" })
    }

    await recordEvent(sessionId, sanitizedType, sanitizedPayload)
    res.status(204).send()
  } catch (err) {
    logger.error("Error recording event:", err)
    res.status(500).json({ error: "Failed to record event" })
  }
})

router.post("/session/end", trackingLimiter, async (req, res) => {
  try {
    const { sessionId, durationMs, endReason } = req.body
    if (!sessionId) {
      return res.status(400).json({ error: "sessionId is required" })
    }

    const sanitizedEndReason = sanitizeString(endReason, 100)
    const validatedDuration = typeof durationMs === "number" && durationMs >= 0 ? durationMs : 0

    await endSession(sessionId, validatedDuration, sanitizedEndReason || "unknown")
    res.status(204).send()
  } catch (err) {
    logger.error("Error ending session:", err)
    res.status(500).json({ error: "Failed to end session" })
  }
})

router.post("/heartbeat", heartbeatLimiter, async (req, res) => {
  try {
    const { sessionId } = req.body
    if (!sessionId) {
      return res.status(400).json({ error: "sessionId is required" })
    }

    await heartbeatSession(sessionId)
    res.status(204).send()
  } catch (err) {
    logger.error("Error sending heartbeat:", err)
    res.status(500).json({ error: "Failed to send heartbeat" })
  }
})

export default router
