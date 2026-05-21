import { Router } from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import prisma from "../utils/db"
import { authenticate } from "../middleware/auth"
import {
  getActivityReport,
  getPerformanceReport,
  getProgressReport,
  getPinUsageReport,
  getSessions,
  getStudents,
  getStudentEngagementReport,
  getSketchDifficultyReport,
  getErrorTrendReport,
  getBoardUsageReport,
  getStudentDetail,
} from "../services/reportService"

function parseDateRange(query: Record<string, unknown>) {
  const start = query.start as string | undefined
  const end = query.end as string | undefined
  if (!start && !end) return { range: null, error: null }
  const startDate = start ? new Date(start) : null
  const endDate = end ? new Date(end) : null
  if ((start && isNaN(startDate!.getTime())) || (end && isNaN(endDate!.getTime()))) {
    return { range: null, error: "Invalid date format. Use ISO 8601 (e.g., 2024-01-01T00:00:00Z)." }
  }
  return { range: { start, end }, error: null }
}

function dateRangeParams(query: Record<string, unknown>) {
  const { range, error } = parseDateRange(query)
  return error ? null : range || undefined
}

const router = Router()

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body
    if (!username || !password) {
      return res.status(400).json({ error: "username and password are required" })
    }

    if (typeof username !== "string" || typeof password !== "string") {
      return res.status(400).json({ error: "Invalid input format" })
    }

    if (username.length > 100 || password.length > 200) {
      return res.status(400).json({ error: "Input too long" })
    }

    const user = await prisma.adminUser.findUnique({ where: { username } })
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    const token = jwt.sign({ adminId: user.id }, JWT_SECRET, { expiresIn: "24h" })
    res.json({ token })
  } catch (err) {
    console.error("Error during login:", err)
    res.status(500).json({ error: "Login failed" })
  }
})

router.get("/reports/activity", authenticate, async (req, res) => {
  const range = dateRangeParams(req.query)
  if (!range) return res.status(400).json({ error: "Invalid date format" })
  try {
    const report = await getActivityReport(range)
    res.json(report)
  } catch (err) {
    console.error("Error getting activity report:", err)
    res.status(500).json({ error: "Failed to get activity report" })
  }
})

router.get("/reports/performance", authenticate, async (req, res) => {
  const range = dateRangeParams(req.query)
  if (!range) return res.status(400).json({ error: "Invalid date format" })
  try {
    const report = await getPerformanceReport(range)
    res.json(report)
  } catch (err) {
    console.error("Error getting performance report:", err)
    res.status(500).json({ error: "Failed to get performance report" })
  }
})

router.get("/reports/progress", authenticate, async (req, res) => {
  try {
    const report = await getProgressReport()
    res.json(report)
  } catch (err) {
    console.error("Error getting progress report:", err)
    res.status(500).json({ error: "Failed to get progress report" })
  }
})

router.get("/reports/pins", authenticate, async (req, res) => {
  try {
    const report = await getPinUsageReport()
    res.json(report)
  } catch (err) {
    console.error("Error getting pin usage report:", err)
    res.status(500).json({ error: "Failed to get pin usage report" })
  }
})

router.get("/sessions", authenticate, async (req, res) => {
  const range = dateRangeParams(req.query)
  if (!range) return res.status(400).json({ error: "Invalid date format" })
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20))
    const result = await getSessions(page, limit, range)
    res.json(result)
  } catch (err) {
    console.error("Error getting sessions:", err)
    res.status(500).json({ error: "Failed to get sessions" })
  }
})

router.get("/students", authenticate, async (req, res) => {
  try {
    const students = await getStudents()
    res.json(students)
  } catch (err) {
    console.error("Error getting students:", err)
    res.status(500).json({ error: "Failed to get students" })
  }
})

router.get("/reports/student-engagement", authenticate, async (req, res) => {
  const range = dateRangeParams(req.query)
  if (!range) return res.status(400).json({ error: "Invalid date format" })
  try {
    const report = await getStudentEngagementReport(range)
    res.json(report)
  } catch (err) {
    console.error("Error getting student engagement report:", err)
    res.status(500).json({ error: "Failed to get student engagement report" })
  }
})

router.get("/reports/sketch-difficulty", authenticate, async (req, res) => {
  const range = dateRangeParams(req.query)
  if (!range) return res.status(400).json({ error: "Invalid date format" })
  try {
    const report = await getSketchDifficultyReport(range)
    res.json(report)
  } catch (err) {
    console.error("Error getting sketch difficulty report:", err)
    res.status(500).json({ error: "Failed to get sketch difficulty report" })
  }
})

router.get("/reports/error-trends", authenticate, async (req, res) => {
  const range = dateRangeParams(req.query)
  if (!range) return res.status(400).json({ error: "Invalid date format" })
  try {
    const report = await getErrorTrendReport(range)
    res.json(report)
  } catch (err) {
    console.error("Error getting error trends report:", err)
    res.status(500).json({ error: "Failed to get error trends report" })
  }
})

router.get("/reports/board-usage", authenticate, async (req, res) => {
  const range = dateRangeParams(req.query)
  if (!range) return res.status(400).json({ error: "Invalid date format" })
  try {
    const report = await getBoardUsageReport(range)
    res.json(report)
  } catch (err) {
    console.error("Error getting board usage report:", err)
    res.status(500).json({ error: "Failed to get board usage report" })
  }
})

router.get("/students/:id", authenticate, async (req, res) => {
  const range = dateRangeParams(req.query)
  if (!range) return res.status(400).json({ error: "Invalid date format" })
  try {
    const detail = await getStudentDetail(req.params.id, range)
    if (!detail) return res.status(404).json({ error: "Student not found" })
    res.json(detail)
  } catch (err) {
    console.error("Error getting student detail:", err)
    res.status(500).json({ error: "Failed to get student detail" })
  }
})

export default router
