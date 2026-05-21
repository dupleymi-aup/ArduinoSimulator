import request from "supertest"
import express from "express"
import jwt from "jsonwebtoken"

// Mock prisma before importing routes
jest.mock("../src/utils/db", () => ({
  __esModule: true,
  default: {
    session: {
      count: jest.fn().mockResolvedValue(0),
      findMany: jest.fn().mockResolvedValue([]),
      groupBy: jest.fn().mockResolvedValue([]),
    },
    event: {
      findMany: jest.fn().mockResolvedValue([]),
    },
    student: {
      count: jest.fn().mockResolvedValue(0),
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
    },
    adminUser: {
      findUnique: jest.fn().mockResolvedValue(null),
    },
  },
}))

const JWT_SECRET = "test-secret-key"

// Mock auth middleware
jest.mock("../src/middleware/auth", () => {
  const authMiddleware = (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization
    if (!authHeader) return res.status(401).json({ error: "No authorization header" })
    const token = authHeader.split(" ")[1]
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { adminId: string }
      ;(req as any).adminId = decoded.adminId
      next()
    } catch {
      return res.status(401).json({ error: "Invalid token" })
    }
  }
  return { __esModule: true, authenticate: authMiddleware }
})

// Set env before importing routes
process.env.JWT_SECRET = JWT_SECRET

import adminRouter from "../src/routes/admin"

function createTestApp() {
  const app = express()
  app.use(express.json())
  app.use("/api/admin", adminRouter)
  return app
}

function getAuthToken() {
  return jwt.sign({ adminId: "test-admin" }, JWT_SECRET, { expiresIn: "24h" })
}

describe("Admin API", () => {
  let app: ReturnType<typeof createTestApp>
  let token: string

  beforeEach(() => {
    app = createTestApp()
    token = getAuthToken()
  })

  describe("POST /api/admin/login", () => {
    test("returns 400 when credentials are missing", async () => {
      const res = await request(app).post("/api/admin/login").send({})
      expect(res.status).toBe(400)
      expect(res.body.error).toContain("required")
    })

    test("returns 400 for non-string credentials", async () => {
      const res = await request(app)
        .post("/api/admin/login")
        .send({ username: 123, password: "test" })
      expect(res.status).toBe(400)
      expect(res.body.error).toContain("Invalid input format")
    })

    test("returns 401 for non-existent user", async () => {
      const res = await request(app)
        .post("/api/admin/login")
        .send({ username: "nouser", password: "test" })
      expect(res.status).toBe(401)
    })
  })

  describe("GET /api/admin/reports/activity", () => {
    test("returns 401 without token", async () => {
      const res = await request(app).get("/api/admin/reports/activity")
      expect(res.status).toBe(401)
    })

    test("returns activity data with valid token", async () => {
      const res = await request(app)
        .get("/api/admin/reports/activity")
        .set("Authorization", `Bearer ${token}`)
      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty("totalSessions")
      expect(res.body).toHaveProperty("avgDurationMs")
      expect(res.body).toHaveProperty("topExamples")
      expect(res.body).toHaveProperty("sessionsByDay")
    })

    test("rejects invalid date format", async () => {
      const res = await request(app)
        .get("/api/admin/reports/activity?start=not-a-date")
        .set("Authorization", `Bearer ${token}`)
      expect(res.status).toBe(400)
      expect(res.body.error).toBe("Invalid date format")
    })
  })

  describe("GET /api/admin/reports/performance", () => {
    test("returns performance data with valid token", async () => {
      const res = await request(app)
        .get("/api/admin/reports/performance")
        .set("Authorization", `Bearer ${token}`)
      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty("totalSessions")
      expect(res.body).toHaveProperty("successRate")
      expect(res.body).toHaveProperty("topErrors")
    })
  })

  describe("GET /api/admin/reports/progress", () => {
    test("returns progress data with valid token", async () => {
      const res = await request(app)
        .get("/api/admin/reports/progress")
        .set("Authorization", `Bearer ${token}`)
      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty("totalStudents")
      expect(res.body).toHaveProperty("examples")
    })
  })

  describe("GET /api/admin/reports/student-engagement", () => {
    test("returns engagement data with valid token", async () => {
      const res = await request(app)
        .get("/api/admin/reports/student-engagement")
        .set("Authorization", `Bearer ${token}`)
      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty("students")
      expect(res.body).toHaveProperty("heatmapByDay")
      expect(res.body).toHaveProperty("heatmapByHour")
      expect(res.body).toHaveProperty("atRiskStudents")
      expect(res.body).toHaveProperty("totalActiveStudents")
    })
  })

  describe("GET /api/admin/reports/sketch-difficulty", () => {
    test("returns difficulty data with valid token", async () => {
      const res = await request(app)
        .get("/api/admin/reports/sketch-difficulty")
        .set("Authorization", `Bearer ${token}`)
      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty("sketches")
      expect(res.body).toHaveProperty("mostAttempted")
      expect(res.body).toHaveProperty("hardestSketch")
    })
  })

  describe("GET /api/admin/reports/error-trends", () => {
    test("returns error trend data with valid token", async () => {
      const res = await request(app)
        .get("/api/admin/reports/error-trends")
        .set("Authorization", `Bearer ${token}`)
      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty("errorTrend")
      expect(res.body).toHaveProperty("errorCategories")
      expect(res.body).toHaveProperty("errorsByBoard")
      expect(res.body).toHaveProperty("totalErrors")
      expect(res.body).toHaveProperty("errorResolutionRate")
    })
  })

  describe("GET /api/admin/reports/board-usage", () => {
    test("returns board usage data with valid token", async () => {
      const res = await request(app)
        .get("/api/admin/reports/board-usage")
        .set("Authorization", `Bearer ${token}`)
      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty("boardPerformance")
      expect(res.body).toHaveProperty("totalSessions")
      expect(res.body).toHaveProperty("mostPopularBoard")
      expect(res.body).toHaveProperty("popularBoardPerSketch")
    })
  })

  describe("GET /api/admin/sessions", () => {
    test("returns paginated sessions with valid token", async () => {
      const res = await request(app)
        .get("/api/admin/sessions?page=1&limit=10")
        .set("Authorization", `Bearer ${token}`)
      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty("sessions")
      expect(res.body).toHaveProperty("total")
      expect(res.body).toHaveProperty("page")
      expect(res.body).toHaveProperty("totalPages")
    })
  })

  describe("GET /api/admin/students", () => {
    test("returns students list with valid token", async () => {
      const res = await request(app)
        .get("/api/admin/students")
        .set("Authorization", `Bearer ${token}`)
      expect(res.status).toBe(200)
      expect(Array.isArray(res.body)).toBe(true)
    })
  })

  describe("GET /api/admin/reports/session-end", () => {
    test("returns 401 without token", async () => {
      const res = await request(app).get("/api/admin/reports/session-end")
      expect(res.status).toBe(401)
    })

    test("returns session end data with valid token", async () => {
      const res = await request(app)
        .get("/api/admin/reports/session-end")
        .set("Authorization", `Bearer ${token}`)
      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty("totalSessions")
      expect(res.body).toHaveProperty("byReason")
      expect(res.body).toHaveProperty("crashRate")
      expect(res.body).toHaveProperty("completionRate")
      expect(res.body).toHaveProperty("abandonmentRate")
      expect(res.body).toHaveProperty("trendOverTime")
      expect(res.body).toHaveProperty("incompleteCount")
    })
  })

  describe("GET /api/admin/reports/file-workflow", () => {
    test("returns 401 without token", async () => {
      const res = await request(app).get("/api/admin/reports/file-workflow")
      expect(res.status).toBe(401)
    })

    test("returns file workflow data with valid token", async () => {
      const res = await request(app)
        .get("/api/admin/reports/file-workflow")
        .set("Authorization", `Bearer ${token}`)
      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty("totalSaves")
      expect(res.body).toHaveProperty("totalOpens")
      expect(res.body).toHaveProperty("totalNewFiles")
      expect(res.body).toHaveProperty("byType")
      expect(res.body).toHaveProperty("savesOverTime")
      expect(res.body).toHaveProperty("avgSavesPerSession")
    })
  })

  describe("GET /api/admin/reports/serial-usage", () => {
    test("returns 401 without token", async () => {
      const res = await request(app).get("/api/admin/reports/serial-usage")
      expect(res.status).toBe(401)
    })

    test("returns serial usage data with valid token", async () => {
      const res = await request(app)
        .get("/api/admin/reports/serial-usage")
        .set("Authorization", `Bearer ${token}`)
      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty("totalOutputs")
      expect(res.body).toHaveProperty("totalSends")
      expect(res.body).toHaveProperty("byType")
      expect(res.body).toHaveProperty("serialOverTime")
      expect(res.body).toHaveProperty("interactiveRatio")
    })
  })

  describe("GET /api/admin/reports/student-cohort", () => {
    test("returns 401 without token", async () => {
      const res = await request(app).get("/api/admin/reports/student-cohort")
      expect(res.status).toBe(401)
    })

    test("returns student cohort data with valid token", async () => {
      const res = await request(app)
        .get("/api/admin/reports/student-cohort")
        .set("Authorization", `Bearer ${token}`)
      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty("totalStudents")
      expect(res.body).toHaveProperty("returningStudentPct")
      expect(res.body).toHaveProperty("avgSessionsPerStudent")
      expect(res.body).toHaveProperty("cohortsByWeek")
      expect(res.body).toHaveProperty("retentionData")
      expect(res.body).toHaveProperty("newVsReturning")
    })
  })

  describe("GET /api/admin/reports/board-changes", () => {
    test("returns 401 without token", async () => {
      const res = await request(app).get("/api/admin/reports/board-changes")
      expect(res.status).toBe(401)
    })

    test("returns board change data with valid token", async () => {
      const res = await request(app)
        .get("/api/admin/reports/board-changes")
        .set("Authorization", `Bearer ${token}`)
      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty("totalBoardChanges")
      expect(res.body).toHaveProperty("uniqueStudentsSwitching")
      expect(res.body).toHaveProperty("byBoardType")
      expect(res.body).toHaveProperty("topSwitchers")
      expect(res.body).toHaveProperty("switchingVsDuration")
    })
  })

  describe("Date validation", () => {
    test("returns 400 for invalid date format on session-end", async () => {
      const res = await request(app)
        .get("/api/admin/reports/session-end?start=not-a-date")
        .set("Authorization", `Bearer ${token}`)
      expect(res.status).toBe(400)
      expect(res.body).toHaveProperty("error")
    })

    test("returns 400 for invalid date format on file-workflow", async () => {
      const res = await request(app)
        .get("/api/admin/reports/file-workflow?end=invalid")
        .set("Authorization", `Bearer ${token}`)
      expect(res.status).toBe(400)
      expect(res.body).toHaveProperty("error")
    })
  })
})
