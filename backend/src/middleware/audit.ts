import { Response, NextFunction } from 'express'
import { AuthRequest } from './auth.js'
import { prisma } from '../index.js'

export function auditMiddleware(req: AuthRequest, _res: Response, next: NextFunction): void {
  const originalJson = _res.json.bind(_res)
  _res.json = function (body: unknown) {
    if (req.userId && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      const targetType = req.path.split('/')[2] || 'unknown'
      const targetId = String(req.params.id || '')
      const changes = req.method !== 'DELETE' ? req.body : undefined
      prisma.auditLog.create({
        data: {
          userId: req.userId,
          action: req.method,
          targetType,
          targetId,
          changes: changes ? { body: changes } : undefined,
        },
      }).catch(() => undefined)
    }
    return originalJson(body)
  }
  next()
}
