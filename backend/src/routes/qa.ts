import { Router, Response } from 'express'
import { prisma } from '../index.js'
import { requireAuth, AuthRequest } from '../middleware/auth.js'
import { naturalLanguageQuery } from '../services/ai.js'

const router = Router()

router.post('/ask', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { question } = req.body
    if (!question || !question.trim()) {
      res.status(400).json({ error: '请输入问题' })
      return
    }

    // Fetch all approved parameters
    const parameters = await prisma.parameter.findMany({
      where: { status: 'approved' },
      include: {
        paper: { select: { filename: true } },
        template: { select: { name: true } },
      },
    })

    if (parameters.length === 0) {
      res.json({ answer: '参数库中暂无数据，请先完成参数提取和审核。', results: [] })
      return
    }

    const formatted = parameters.map(p => ({
      id: p.id,
      jsonValue: p.jsonValue as Record<string, unknown>,
      paperTitle: p.paper.filename,
      templateName: p.template.name,
    }))

    const answer = await naturalLanguageQuery(question.trim(), formatted)

    // Save to recent queries
    recentQueries.push({ question: question.trim(), answer, createdAt: new Date().toISOString() })
    if (recentQueries.length > 50) recentQueries.shift()

    res.json({
      question: question.trim(),
      answer,
      resultCount: parameters.length,
    })
  } catch (err: any) {
    res.status(500).json({ error: `查询失败: ${err.message}` })
  }
})

// Get recent queries (from memory, not persisted - simplified)
const recentQueries: Array<{ question: string; answer: string; createdAt: string }> = []

router.get('/history', requireAuth, async (_req: AuthRequest, res: Response) => {
  res.json({ queries: recentQueries.slice(-20).reverse() })
})

// Export recentQueries for use in route
export { recentQueries }

export default router
