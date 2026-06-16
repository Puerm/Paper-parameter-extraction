import { Router, Response } from 'express'
import { prisma } from '../index.js'
import { requireAuth, AuthRequest } from '../middleware/auth.js'

const router = Router()

router.get('/unread-count', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const count = await prisma.notification.count({
      where: { userId: req.userId!, isRead: false },
    })
    res.json({ count })
  } catch {
    res.status(500).json({ error: '获取未读计数失败' })
  }
})

router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.userId! },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    res.json({ notifications })
  } catch {
    res.status(500).json({ error: '获取通知列表失败' })
  }
})

router.patch('/:id/read', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.notification.updateMany({
      where: { id: String(req.params.id), userId: req.userId! },
      data: { isRead: true },
    })
    res.json({ message: '已读' })
  } catch {
    res.status(500).json({ error: '操作失败' })
  }
})

router.patch('/read-all', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.userId!, isRead: false },
      data: { isRead: true },
    })
    res.json({ message: '全部已读' })
  } catch {
    res.status(500).json({ error: '操作失败' })
  }
})

// Helper to create notifications from other routes
export async function createNotification(userId: string, type: string, message: string) {
  await prisma.notification.create({ data: { userId, type, message } })
}

export default router
