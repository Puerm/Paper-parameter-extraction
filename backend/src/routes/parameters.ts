import { Router, Response } from 'express'
import { prisma } from '../index.js'
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth.js'
import { extractParameters } from '../services/ai.js'
import { createNotification } from './notifications.js'

const router = Router()

// List parameters (filter by status for review queue)
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { status, paperId } = req.query
    const where: any = {}

    if (status) where.status = String(status)
    if (paperId) where.paperId = String(paperId)

    // Users can only see their own papers' parameters
    if (req.userRole === 'user') {
      const userPapers = await prisma.paper.findMany({
        where: { uploadedById: req.userId },
        select: { id: true },
      })
      where.paperId = { in: userPapers.map(p => p.id) }
    }

    const parameters = await prisma.parameter.findMany({
      where,
      include: {
        paper: { select: { id: true, filename: true, content: true } },
        template: { select: { id: true, name: true } },
        createdBy: { select: { id: true, username: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    res.json({ parameters })
  } catch {
    res.status(500).json({ error: '获取参数列表失败' })
  }
})

// Get single parameter detail
router.get('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const param = await prisma.parameter.findUnique({
      where: { id: String(req.params.id) },
      include: {
        paper: { select: { id: true, filename: true, content: true } },
        template: { select: { id: true, name: true, yamlContent: true } },
        versions: { orderBy: { version: 'desc' }, include: { modifiedBy: { select: { username: true } } } },
      },
    })
    if (!param) {
      res.status(404).json({ error: '参数记录不存在' })
      return
    }
    res.json(param)
  } catch {
    res.status(500).json({ error: '获取参数详情失败' })
  }
})

// Start AI extraction
router.post('/extract', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { paperId, templateId } = req.body
    if (!paperId || !templateId) {
      res.status(400).json({ error: '请选择论文和模板' })
      return
    }

    const paper = await prisma.paper.findUnique({ where: { id: paperId } })
    if (!paper || !paper.content) {
      res.status(400).json({ error: '论文未解析或无内容' })
      return
    }

    const template = await prisma.template.findUnique({ where: { id: templateId } })
    if (!template) {
      res.status(404).json({ error: '模板不存在' })
      return
    }

    // Create parameter record with "extracting" status
    const param = await prisma.parameter.create({
      data: {
        paperId,
        templateId,
        jsonValue: {},
        status: 'extracting',
        createdById: req.userId!,
      },
    })

    // Run extraction
    const result = await extractParameters(paper.content, template.yamlContent)

    if (result.success && result.data) {
      // Save version 1
      await prisma.parameterVersion.create({
        data: {
          parameterId: param.id,
          version: 1,
          jsonValue: result.data,
          modifiedById: req.userId!,
        },
      })

      await prisma.parameter.update({
        where: { id: param.id },
        data: { jsonValue: result.data, status: 'extracted', version: 1 },
      })

      await prisma.paper.update({
        where: { id: paperId },
        data: { extractedCount: { increment: 1 } },
      })

      await createNotification(req.userId!, 'extract_complete', `论文「${paper.filename}」参数提取完成`)

      res.status(201).json({ ...param, jsonValue: result.data, status: 'extracted', attempts: result.attempts })
    } else {
      await prisma.parameter.update({
        where: { id: param.id },
        data: { status: 'extract_failed' },
      })
      res.status(422).json({ error: result.error, attempts: result.attempts })
    }
  } catch {
    res.status(500).json({ error: '提取失败' })
  }
})

// Update extracted parameters (review modification)
router.put('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { jsonValue } = req.body
    if (!jsonValue || typeof jsonValue !== 'object') {
      res.status(400).json({ error: '参数数据格式无效' })
      return
    }

    const param = await prisma.parameter.findUnique({ where: { id: String(req.params.id) } })
    if (!param) {
      res.status(404).json({ error: '参数记录不存在' })
      return
    }

    // Optimistic lock check
    const { expectedVersion } = req.body
    if (expectedVersion !== undefined && param.version !== expectedVersion) {
      res.status(409).json({ error: '数据已被其他人修改，请刷新后重试', currentVersion: param.version })
      return
    }

    const newVersion = param.version + 1
    await prisma.parameterVersion.create({
      data: {
        parameterId: param.id,
        version: newVersion,
        jsonValue,
        modifiedById: req.userId!,
      },
    })

    const updated = await prisma.parameter.update({
      where: { id: param.id },
      data: { jsonValue, version: newVersion },
    })

    res.json(updated)
  } catch {
    res.status(500).json({ error: '更新参数失败' })
  }
})

// Submit for review
router.post('/:id/submit', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const param = await prisma.parameter.findUnique({ where: { id: String(req.params.id) } })
    if (!param || param.status !== 'extracted') {
      res.status(400).json({ error: '只能提交已提取完成的参数' })
      return
    }

    await prisma.parameter.update({
      where: { id: param.id },
      data: { status: 'reviewing' },
    })

    res.json({ message: '已提交审核' })
  } catch {
    res.status(500).json({ error: '提交失败' })
  }
})

// Approve (reviewer/admin only)
router.post('/:id/approve', requireAuth, requireRole('reviewer', 'admin'), async (req: AuthRequest, res: Response) => {
  try {
    const param = await prisma.parameter.findUnique({ where: { id: String(req.params.id) } })
    if (!param || param.status !== 'reviewing') {
      res.status(400).json({ error: '只能审核"审核中"状态的参数' })
      return
    }

    await prisma.parameter.update({
      where: { id: param.id },
      data: { status: 'approved' },
    })

    await prisma.notification.create({
      data: {
        userId: param.createdById,
        type: 'review_approved',
        message: '你的参数提取已通过审核',
      },
    })

    res.json({ message: '审核通过，参数已入库' })
  } catch {
    res.status(500).json({ error: '审核失败' })
  }
})

// Reject (reviewer/admin only)
router.post('/:id/reject', requireAuth, requireRole('reviewer', 'admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { reason } = req.body
    const param = await prisma.parameter.findUnique({ where: { id: String(req.params.id) } })
    if (!param || param.status !== 'reviewing') {
      res.status(400).json({ error: '只能审核"审核中"状态的参数' })
      return
    }

    await prisma.parameter.update({
      where: { id: param.id },
      data: { status: 'rejected' },
    })

    await prisma.notification.create({
      data: {
        userId: param.createdById,
        type: 'review_rejected',
        message: `参数提取审核未通过${reason ? `：${reason}` : ''}`,
      },
    })

    res.json({ message: '已拒绝，可重新提取' })
  } catch {
    res.status(500).json({ error: '操作失败' })
  }
})

// Get version history for a parameter
router.get('/:id/versions', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const versions = await prisma.parameterVersion.findMany({
      where: { parameterId: String(req.params.id) },
      orderBy: { version: 'desc' },
      include: { modifiedBy: { select: { username: true } } },
    })
    res.json({ versions })
  } catch {
    res.status(500).json({ error: '获取版本历史失败' })
  }
})

export default router
