import { Router, Response } from 'express'
import { prisma } from '../index.js'
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth.js'
import YAML from 'yaml'

const router = Router()

// All template mutations require admin
const requireAdmin = [requireAuth, requireRole('admin')]

router.get('/', requireAuth, async (_req: AuthRequest, res: Response) => {
  try {
    const templates = await prisma.template.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        yamlContent: true,
        createdById: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { parameters: true } },
      },
    })
    res.json({ templates })
  } catch {
    res.status(500).json({ error: '获取模板列表失败' })
  }
})

router.get('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const template = await prisma.template.findUnique({
      where: { id: String(req.params.id) },
      include: { _count: { select: { parameters: true } } },
    })
    if (!template) {
      res.status(404).json({ error: '模板不存在' })
      return
    }
    res.json(template)
  } catch {
    res.status(500).json({ error: '获取模板详情失败' })
  }
})

router.post('/', ...requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { name, yamlContent } = req.body
    if (!name || !yamlContent) {
      res.status(400).json({ error: '模板名称和YAML内容不能为空' })
      return
    }

    // Validate YAML
    try {
      YAML.parse(yamlContent)
    } catch {
      res.status(400).json({ error: 'YAML格式无效' })
      return
    }

    const existing = await prisma.template.findUnique({ where: { name } })
    if (existing) {
      res.status(409).json({ error: '模板名称已存在' })
      return
    }

    const template = await prisma.template.create({
      data: { name, yamlContent, createdById: req.userId! },
    })
    res.status(201).json(template)
  } catch {
    res.status(500).json({ error: '创建模板失败' })
  }
})

router.put('/:id', ...requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { name, yamlContent } = req.body
    if (!name || !yamlContent) {
      res.status(400).json({ error: '模板名称和YAML内容不能为空' })
      return
    }

    try {
      YAML.parse(yamlContent)
    } catch {
      res.status(400).json({ error: 'YAML格式无效' })
      return
    }

    const existing = await prisma.template.findFirst({
      where: { name, NOT: { id: String(req.params.id) } },
    })
    if (existing) {
      res.status(409).json({ error: '模板名称已存在' })
      return
    }

    const template = await prisma.template.update({
      where: { id: String(req.params.id) },
      data: { name, yamlContent },
    })
    res.json(template)
  } catch {
    res.status(500).json({ error: '更新模板失败' })
  }
})

router.delete('/:id', ...requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id)
    const refCount = await prisma.parameter.count({ where: { templateId: id } })
    if (refCount > 0) {
      res.status(409).json({ error: `该模板被 ${refCount} 条参数引用，无法删除` })
      return
    }

    await prisma.template.delete({ where: { id } })
    res.json({ message: '模板已删除' })
  } catch {
    res.status(500).json({ error: '删除模板失败' })
  }
})

router.post('/:id/clone', ...requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const original = await prisma.template.findUnique({ where: { id: String(req.params.id) } })
    if (!original) {
      res.status(404).json({ error: '模板不存在' })
      return
    }

    let newName = `${original.name} (副本)`
    let counter = 1
    while (await prisma.template.findUnique({ where: { name: newName } })) {
      counter++
      newName = `${original.name} (副本${counter})`
    }

    const template = await prisma.template.create({
      data: {
        name: newName,
        yamlContent: original.yamlContent,
        createdById: req.userId!,
      },
    })
    res.status(201).json(template)
  } catch {
    res.status(500).json({ error: '克隆模板失败' })
  }
})

export default router
