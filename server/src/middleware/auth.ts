import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  throw new Error(
    "JWT_SECRET environment variable is required. Set it before starting the server."
  )
}

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
