import { Request, Response, NextFunction } from "express"
import { logger } from "../utils/logger"

const isDev = process.env.NODE_ENV !== "production"

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction) {
  const timestamp = new Date().toISOString()
  const requestId = req.headers["x-request-id"] as string | undefined

  logger.error(
    `${req.method} ${req.url}${requestId ? ` (req: ${requestId})` : ""}`,
    err.message,
    isDev ? err.stack : undefined
  )

  res.status(500).json({
    error: "Internal server error",
    ...(isDev && { stack: err.stack, details: err.message }),
  })
}
