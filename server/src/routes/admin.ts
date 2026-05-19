import { Router } from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import prisma from "../utils/db"
import { authenticate, JWT_SECRET } from "../middleware/auth"
import {
  getActivityReport,
  getPerformanceReport,
  getProgressReport,
  getPinUsageReport,
  getSessions,
  getStudents,
} from "../services/reportService"

const router = Router()

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body
    if (!username || !password) {
      return res.status(400).json({ error: "username and password are required" })
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
  try {
    const report = await getActivityReport({ start: req.query.start as string, end: req.query.end as string })
    res.json(report)
  } catch (err) {
    console.error("Error getting activity report:", err)
    res.status(500).json({ error: "Failed to get activity report" })
  }
})

router.get("/reports/performance", authenticate, async (req, res) => {
  try {
    const report = await getPerformanceReport({ start: req.query.start as string, end: req.query.end as string })
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
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20
    const result = await getSessions(page, limit, { start: req.query.start as string, end: req.query.end as string })
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

export default router
