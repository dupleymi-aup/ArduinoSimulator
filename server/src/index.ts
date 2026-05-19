import express from "express"
import cors from "cors"
import helmet from "helmet"
import rateLimit from "express-rate-limit"
import healthRoute from "./routes/health"
import trackRoute from "./routes/track"
import adminRoute from "./routes/admin"
import { errorHandler } from "./middleware/errorHandler"

const app = express()
const PORT = process.env.PORT || 3001

const corsOrigins = process.env.CORS_ORIGINS?.split(",") || ["http://localhost:3000"]

app.use(helmet())
app.use(cors({ origin: corsOrigins, credentials: true }))
app.use(express.json())

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Too many login attempts. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
})

app.use("/api/health", healthRoute)
app.use("/api/track", trackRoute)
app.use("/api/admin", adminRoute)
app.use("/api/admin/login", loginLimiter)

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Arduino Simulator server running on port ${PORT}`)
})
