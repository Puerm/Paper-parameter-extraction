import { Router, Response } from 'express'
import { prisma } from '../index.js'
import { requireAuth, AuthRequest } from '../middleware/auth.js'

const router = Router()

router.get('/stats', requireAuth, async (_req: AuthRequest, res: Response) => {
  try {
    const [totalPapers, totalTemplates, totalParameters] = await Promise.all([
      prisma.paper.count(),
      prisma.template.count(),
      prisma.parameter.count(),
    ])

    const totalExtractions = totalPapers || 1
    const successCount = await prisma.paper.count({ where: { status: { in: ['parsed', 'reviewed'] } } })
    const successRate = Math.round((successCount / totalExtractions) * 100)

    res.json({ totalPapers, totalTemplates, totalParameters, successRate })
  } catch {
    res.status(500).json({ error: '获取统计数据失败' })
  }
})

router.get('/trends', requireAuth, async (_req: AuthRequest, res: Response) => {
  try {
    // Papers uploaded per day (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const papers = await prisma.paper.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { status: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    })

    // Upload trend by day
    const uploadTrend: Record<string, number> = {}
    const extractionTrend: Record<string, { total: number; success: number }> = {}

    papers.forEach(p => {
      const day = p.createdAt.toISOString().split('T')[0]
      uploadTrend[day] = (uploadTrend[day] || 0) + 1

      if (!extractionTrend[day]) extractionTrend[day] = { total: 0, success: 0 }
      extractionTrend[day].total++
      if (p.status === 'parsed' || p.status === 'reviewed') {
        extractionTrend[day].success++
      }
    })

    // Template usage ranking
    const templateUsage = await prisma.parameter.groupBy({
      by: ['templateId'],
      _count: { templateId: true },
      orderBy: { _count: { templateId: 'desc' } },
      take: 10,
    })

    const templateNames = await Promise.all(
      templateUsage.map(async t => {
        const tmpl = await prisma.template.findUnique({
          where: { id: t.templateId },
          select: { name: true },
        })
        return { name: tmpl?.name || '未知', count: t._count.templateId }
      })
    )

    res.json({
      uploadTrend: Object.entries(uploadTrend).map(([date, count]) => ({ date, count })),
      extractionSuccess: Object.entries(extractionTrend).map(([date, d]) => ({
        date,
        rate: d.total > 0 ? Math.round((d.success / d.total) * 100) : 0,
      })),
      templateRanking: templateNames,
    })
  } catch {
    res.status(500).json({ error: '获取趋势数据失败' })
  }
})

export default router
