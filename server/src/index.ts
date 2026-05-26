import express from "express"
import cors from "cors"
import helmet from "helmet"
import healthRoute from "./routes/health"
import trackRoute from "./routes/track"
import adminRoute from "./routes/admin"
import { errorHandler } from "./middleware/errorHandler"
import { requestIdMiddleware } from "./middleware/requestId"
import { logger } from "./utils/logger"

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

app.listen(PORT, () => {
  logger.info(`Arduino Simulator server running on port ${PORT}`)
})
