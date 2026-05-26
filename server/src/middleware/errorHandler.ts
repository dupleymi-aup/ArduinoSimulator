import { Request, Response, NextFunction } from "express"
import { logger } from "../utils/logger"

const isDev = process.env.NODE_ENV !== "production"

export function errorHandler(err: Error, req: Request & { requestId?: string }, res: Response, _next: NextFunction) {
  const timestamp = new Date().toISOString()

  logger.error(
    `${req.method} ${req.url} (req: ${req.requestId || "unknown"})`,
    err.message,
    isDev ? err.stack : undefined
  )

  res.status(500).json({
    error: "Internal server error",
    ...(isDev && { stack: err.stack, details: err.message }),
  })
}
