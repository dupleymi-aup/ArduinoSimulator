import express from "express"
import cors from "cors"
import healthRoute from "./routes/health"
import trackRoute from "./routes/track"
import adminRoute from "./routes/admin"
import { errorHandler } from "./middleware/errorHandler"

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.use("/api/health", healthRoute)
app.use("/api/track", trackRoute)
app.use("/api/admin", adminRoute)

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Arduino Simulator server running on port ${PORT}`)
})
