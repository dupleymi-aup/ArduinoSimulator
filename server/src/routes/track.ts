import { Router } from "express"
import { getOrCreateStudent, startSession, endSession, heartbeatSession, recordEvent } from "../services/trackingService"

const router = Router()

const sanitizeString = (value: unknown, maxLength = 500): string | undefined => {
  if (typeof value !== "string") return undefined
  const trimmed = value.trim().slice(0, maxLength)
  return trimmed.replace(/[<>]/g, "")
}

router.post("/session/start", async (req, res) => {
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
    console.error("Error starting session:", err)
    res.status(500).json({ error: "Failed to start session" })
  }
})

router.post("/event", async (req, res) => {
  try {
    const { sessionId, type, payload } = req.body
    if (!sessionId || !type) {
      return res.status(400).json({ error: "sessionId and type are required" })
    }

    const sanitizedType = sanitizeString(type, 100)
    const sanitizedPayload = sanitizeString(payload, 2000)

    if (!sanitizedType) {
      return res.status(400).json({ error: "Invalid event type format" })
    }

    await recordEvent(sessionId, sanitizedType, sanitizedPayload)
    res.status(204).send()
  } catch (err) {
    console.error("Error recording event:", err)
    res.status(500).json({ error: "Failed to record event" })
  }
})

router.post("/session/end", async (req, res) => {
  try {
    const { sessionId, durationMs, endReason } = req.body
    if (!sessionId) {
      return res.status(400).json({ error: "sessionId is required" })
    }

    const sanitizedEndReason = sanitizeString(endReason, 100)

    await endSession(sessionId, typeof durationMs === "number" ? durationMs : 0, sanitizedEndReason || "unknown")
    res.status(204).send()
  } catch (err) {
    console.error("Error ending session:", err)
    res.status(500).json({ error: "Failed to end session" })
  }
})

router.post("/heartbeat", async (req, res) => {
  try {
    const { sessionId } = req.body
    if (!sessionId) {
      return res.status(400).json({ error: "sessionId is required" })
    }

    await heartbeatSession(sessionId)
    res.status(204).send()
  } catch (err) {
    console.error("Error sending heartbeat:", err)
    res.status(500).json({ error: "Failed to send heartbeat" })
  }
})

export default router
