import express from "express"
import cors from "cors"
import helmet from "helmet"
import healthRoute from "./routes/health"
import trackRoute from "./routes/track"
import adminRoute from "./routes/admin"
import { errorHandler } from "./middleware/errorHandler"
import { requestIdMiddleware } from "./middleware/requestId"
import { logger } from "./utils/logger"
import prisma from "./utils/db"

const app = express()
const PORT = process.env.PORT || 3001

const corsOrigins = process.env.CORS_ORIGINS?.split(",") || ["http://localhost:3000"]

app.use(helmet())
app.use(cors({ origin: corsOrigins, credentials: true }))
app.use(express.json())
app.use(requestIdMiddleware)

app.use("/api/health", healthRoute)
app.use("/api/track", trackRoute)
app.use("/api/admin", adminRoute)

app.use(errorHandler)

const server = app.listen(PORT, () => {
  logger.info(`Arduino Simulator server running on port ${PORT}`)
})

function gracefulShutdown(signal: string) {
  logger.info(`Received ${signal}. Starting graceful shutdown...`)
  server.close(async () => {
    logger.info("HTTP server closed.")
    await prisma.$disconnect()
    logger.info("Database connection closed.")
    process.exit(0)
  })
  // Force exit after 10s if graceful shutdown hangs
  setTimeout(() => {
    logger.error("Forcing shutdown after timeout.")
    process.exit(1)
  }, 10_000)
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"))
process.on("SIGINT", () => gracefulShutdown("SIGINT"))
