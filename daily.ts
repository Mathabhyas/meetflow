import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-this'

export function verifyAdminCredentials(email: string, password: string): boolean {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@meetflow.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
  return email === adminEmail && password === adminPassword
}

export function createToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch {
    return null
  }
}

export function isAdminRequest(req: any): boolean {
  const token = req.cookies?.admin_token || req.headers?.authorization?.replace('Bearer ', '')
  if (!token) return false
  const payload = verifyToken(token)
  return payload?.role === 'admin'
}
