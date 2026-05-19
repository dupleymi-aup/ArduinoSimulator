import { Router } from "express"
import { getOrCreateStudent, startSession, endSession, heartbeatSession, recordEvent } from "../services/trackingService"

const router = Router()

router.post("/session/start", async (req, res) => {
  try {
    const { studentId, sketchName, boardType } = req.body
    if (!studentId) {
      return res.status(400).json({ error: "studentId is required" })
    }

    const student = await getOrCreateStudent(studentId)
    const session = await startSession(student.id, sketchName, boardType)
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

    await recordEvent(sessionId, type, payload)
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

    await endSession(sessionId, durationMs || 0, endReason || "unknown")
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
