import { Router } from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import prisma from "../utils/db"
import { authenticate, JWT_SECRET } from "../middleware/auth"
import { getCache, setCache } from "../services/cache"
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
  getSessionEndReport,
  getFileWorkflowReport,
  getSerialUsageReport,
  getStudentCohortReport,
  getBoardChangeReport,
  getStudentScorecardReport,
  getLearningPathReport,
  getErrorImpactReport,
  getComparativeReport,
  getSkillsMasteryReport,
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

function dateRangeParams(query: Record<string, unknown>): Record<string, string> | undefined | null {
  const { range, error } = parseDateRange(query)
  if (error) return null
  if (!range) return undefined
  return range as Record<string, string>
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
  if (range === null) return res.status(400).json({ error: "Invalid date format" })
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
  if (range === null) return res.status(400).json({ error: "Invalid date format" })
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
  if (range === null) return res.status(400).json({ error: "Invalid date format" })
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
  if (range === null) return res.status(400).json({ error: "Invalid date format" })
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
  if (range === null) return res.status(400).json({ error: "Invalid date format" })
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
  if (range === null) return res.status(400).json({ error: "Invalid date format" })
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
  if (range === null) return res.status(400).json({ error: "Invalid date format" })
  try {
    const report = await getBoardUsageReport(range)
    res.json(report)
  } catch (err) {
    console.error("Error getting board usage report:", err)
    res.status(500).json({ error: "Failed to get board usage report" })
  }
})

router.get("/reports/session-end", authenticate, async (req, res) => {
  const range = dateRangeParams(req.query)
  if (range === null) return res.status(400).json({ error: "Invalid date format" })
  try {
    const report = await getSessionEndReport(range)
    res.json(report)
  } catch (err) {
    console.error("Error getting session end report:", err)
    res.status(500).json({ error: "Failed to get session end report" })
  }
})

router.get("/reports/file-workflow", authenticate, async (req, res) => {
  const range = dateRangeParams(req.query)
  if (range === null) return res.status(400).json({ error: "Invalid date format" })
  try {
    const report = await getFileWorkflowReport(range)
    res.json(report)
  } catch (err) {
    console.error("Error getting file workflow report:", err)
    res.status(500).json({ error: "Failed to get file workflow report" })
  }
})

router.get("/reports/serial-usage", authenticate, async (req, res) => {
  const range = dateRangeParams(req.query)
  if (range === null) return res.status(400).json({ error: "Invalid date format" })
  try {
    const report = await getSerialUsageReport(range)
    res.json(report)
  } catch (err) {
    console.error("Error getting serial usage report:", err)
    res.status(500).json({ error: "Failed to get serial usage report" })
  }
})

router.get("/reports/student-cohort", authenticate, async (req, res) => {
  const range = dateRangeParams(req.query)
  if (range === null) return res.status(400).json({ error: "Invalid date format" })
  try {
    const report = await getStudentCohortReport(range)
    res.json(report)
  } catch (err) {
    console.error("Error getting student cohort report:", err)
    res.status(500).json({ error: "Failed to get student cohort report" })
  }
})

router.get("/reports/board-changes", authenticate, async (req, res) => {
  const range = dateRangeParams(req.query)
  if (range === null) return res.status(400).json({ error: "Invalid date format" })
  try {
    const report = await getBoardChangeReport(range)
    res.json(report)
  } catch (err) {
    console.error("Error getting board change report:", err)
    res.status(500).json({ error: "Failed to get board change report" })
  }
})

router.get("/reports/student-scorecard", authenticate, async (req, res) => {
  const range = dateRangeParams(req.query)
  if (range === null) return res.status(400).json({ error: "Invalid date format" })
  try {
    const cacheKey = `student-scorecard:${JSON.stringify(req.query)}`
    const cached = getCache(cacheKey)
    if (cached) return res.json(cached)
    const report = await getStudentScorecardReport(range)
    setCache(cacheKey, report)
    res.json(report)
  } catch (err) {
    console.error("Error getting student scorecard report:", err)
    res.status(500).json({ error: "Failed to get student scorecard report" })
  }
})

router.get("/reports/learning-path", authenticate, async (req, res) => {
  const range = dateRangeParams(req.query)
  if (range === null) return res.status(400).json({ error: "Invalid date format" })
  try {
    const cacheKey = `learning-path:${JSON.stringify(req.query)}`
    const cached = getCache(cacheKey)
    if (cached) return res.json(cached)
    const report = await getLearningPathReport(range)
    setCache(cacheKey, report)
    res.json(report)
  } catch (err) {
    console.error("Error getting learning path report:", err)
    res.status(500).json({ error: "Failed to get learning path report" })
  }
})

router.get("/reports/error-impact", authenticate, async (req, res) => {
  const range = dateRangeParams(req.query)
  if (range === null) return res.status(400).json({ error: "Invalid date format" })
  try {
    const cacheKey = `error-impact:${JSON.stringify(req.query)}`
    const cached = getCache(cacheKey)
    if (cached) return res.json(cached)
    const report = await getErrorImpactReport(range)
    setCache(cacheKey, report)
    res.json(report)
  } catch (err) {
    console.error("Error getting error impact report:", err)
    res.status(500).json({ error: "Failed to get error impact report" })
  }
})

router.get("/reports/comparative", authenticate, async (req, res) => {
  const range = dateRangeParams(req.query)
  if (range === null) return res.status(400).json({ error: "Invalid date format" })
  try {
    const cacheKey = `comparative:${JSON.stringify(range)}`
    const cached = getCache(cacheKey)
    if (cached) return res.json(cached)
    const report = await getComparativeReport(range)
    setCache(cacheKey, report)
    res.json(report)
  } catch (err) {
    console.error("Error getting comparative report:", err)
    res.status(500).json({ error: "Failed to get comparative report" })
  }
})

router.get("/reports/skills-mastery", authenticate, async (req, res) => {
  const range = dateRangeParams(req.query)
  if (range === null) return res.status(400).json({ error: "Invalid date format" })
  try {
    const cacheKey = `skills-mastery:${JSON.stringify(req.query)}`
    const cached = getCache(cacheKey)
    if (cached) return res.json(cached)
    const report = await getSkillsMasteryReport(range)
    setCache(cacheKey, report)
    res.json(report)
  } catch (err) {
    console.error("Error getting skills mastery report:", err)
    res.status(500).json({ error: "Failed to get skills mastery report" })
  }
})

router.get("/students/:id", authenticate, async (req, res) => {
  const range = dateRangeParams(req.query)
  if (range === null) return res.status(400).json({ error: "Invalid date format" })
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
