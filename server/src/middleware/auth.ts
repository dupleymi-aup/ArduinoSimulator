import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "arduino-simulator-secret-key-change-in-production"

interface AuthRequest extends Request {
  adminId?: string
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader) {
    return res.status(401).json({ error: "No authorization header" })
  }

  const token = authHeader.split(" ")[1]
  if (!token) {
    return res.status(401).json({ error: "No token provided" })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { adminId: string }
    req.adminId = decoded.adminId
    next()
  } catch {
    return res.status(401).json({ error: "Invalid token" })
  }
}

export { JWT_SECRET }
