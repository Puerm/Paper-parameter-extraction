import { Router, Response } from 'express'
import { prisma } from '../index.js'
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth.js'

const router = Router()

router.get('/', requireAuth, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { userId, targetType, page, pageSize } = req.query
    const where: any = {}

    if (userId) where.userId = String(userId)
    if (targetType) where.targetType = String(targetType)

    const p = Math.max(1, parseInt(String(page || '1')))
    const ps = Math.min(50, Math.max(1, parseInt(String(pageSize || '20'))))

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: { user: { select: { username: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (p - 1) * ps,
        take: ps,
      }),
      prisma.auditLog.count({ where }),
    ])

    res.json({ logs, total, page: p, pageSize: ps, totalPages: Math.ceil(total / ps) })
  } catch {
    res.status(500).json({ error: '获取审计日志失败' })
  }
})

export default router
