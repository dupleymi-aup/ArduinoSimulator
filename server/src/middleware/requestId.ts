import { Request, Response, NextFunction } from "express"
import { randomUUID } from "crypto"

export function requestIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const requestId = (req.headers["x-request-id"] as string) || randomUUID()
  res.setHeader("X-Request-ID", requestId)
  ;(req as Request & { requestId: string }).requestId = requestId
  next()
}
