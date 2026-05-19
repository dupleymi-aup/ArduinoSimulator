import { Request, Response, NextFunction } from "express"

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction) {
  console.error("Server error:", err.message, {
    method: req.method,
    url: req.url,
    statusCode: res.statusCode,
  })
  res.status(500).json({ error: "Internal server error" })
}
