import { Router, Response } from 'express'
import { prisma } from '../index.js'
import { requireAuth, AuthRequest } from '../middleware/auth.js'
import { diffLines } from 'diff'

const router = Router()

// Search parameter library
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { search, tag, page, pageSize } = req.query
    const where: any = { status: 'approved' }

    if (search) {
      where.OR = [
        { paper: { filename: { contains: String(search) } } },
        { template: { name: { contains: String(search) } } },
      ]
    }
    if (tag) {
      where.template = { name: { contains: String(tag) } }
    }

    const p = Math.max(1, parseInt(String(page || '1')))
    const ps = Math.min(50, Math.max(1, parseInt(String(pageSize || '20'))))

    const [parameters, total] = await Promise.all([
      prisma.parameter.findMany({
        where,
        include: {
          paper: { select: { filename: true } },
          template: { select: { name: true } },
        },
        orderBy: { updatedAt: 'desc' },
        skip: (p - 1) * ps,
        take: ps,
      }),
      prisma.parameter.count({ where }),
    ])

    res.json({ parameters, total, page: p, pageSize: ps, totalPages: Math.ceil(total / ps) })
  } catch {
    res.status(500).json({ error: '查询参数库失败' })
  }
})

// Export CSV
router.get('/export/csv', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { search } = req.query
    const where: any = { status: 'approved' }
    if (search) {
      where.OR = [
        { paper: { filename: { contains: String(search) } } },
        { template: { name: { contains: String(search) } } },
      ]
    }

    const parameters = await prisma.parameter.findMany({
      where,
      include: {
        paper: { select: { filename: true } },
        template: { select: { name: true } },
      },
    })

    // Build CSV
    const allKeys = new Set<string>()
    parameters.forEach(p => {
      const json = p.jsonValue as Record<string, unknown>
      Object.keys(json).forEach(k => allKeys.add(k))
    })
    const keys = Array.from(allKeys)

    const header = ['论文', '模板', ...keys].join(',')
    const rows = parameters.map(p => {
      const json = p.jsonValue as Record<string, unknown>
      return [p.paper.filename, p.template.name, ...keys.map(k => {
        const v = json[k]
        if (v === null || v === undefined) return ''
        return `"${String(v).replace(/"/g, '""')}"`
      })].join(',')
    })

    const csv = '﻿' + header + '\n' + rows.join('\n')
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', 'attachment; filename=parameters.csv')
    res.send(csv)
  } catch {
    res.status(500).json({ error: '导出失败' })
  }
})

// Export Excel
router.get('/export/excel', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { search } = req.query
    const where: any = { status: 'approved' }
    if (search) {
      where.OR = [
        { paper: { filename: { contains: String(search) } } },
        { template: { name: { contains: String(search) } } },
      ]
    }

    const parameters = await prisma.parameter.findMany({
      where,
      include: {
        paper: { select: { filename: true } },
        template: { select: { name: true } },
      },
    })

    const XLSX = await import('xlsx')

    const allKeys = new Set<string>()
    parameters.forEach(p => {
      const json = p.jsonValue as Record<string, unknown>
      Object.keys(json).forEach(k => allKeys.add(k))
    })
    const keys = Array.from(allKeys)

    const data = parameters.map(p => {
      const json = p.jsonValue as Record<string, unknown>
      const row: Record<string, string> = { '论文': p.paper.filename, '模板': p.template.name }
      keys.forEach(k => { row[k] = json[k] !== null && json[k] !== undefined ? String(json[k]) : '' })
      return row
    })

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '参数库')
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', 'attachment; filename=parameters.xlsx')
    res.send(buf)
  } catch {
    res.status(500).json({ error: '导出失败' })
  }
})

// Archive parameter (instead of delete)
router.post('/:id/archive', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const param = await prisma.parameter.findUnique({ where: { id: String(req.params.id) } })
    if (!param) {
      res.status(404).json({ error: '参数不存在' })
      return
    }
    if (param.status !== 'approved') {
      res.status(400).json({ error: '只能归档已入库的参数' })
      return
    }

    await prisma.parameter.update({
      where: { id: param.id },
      data: { status: 'archived' },
    })
    res.json({ message: '参数已归档' })
  } catch {
    res.status(500).json({ error: '归档失败' })
  }
})

// Compare two versions
router.get('/:id/diff', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { v1, v2 } = req.query
    const paramId = String(req.params.id)

    let versions
    if (v1 && v2) {
      versions = await prisma.parameterVersion.findMany({
        where: { parameterId: paramId, version: { in: [parseInt(String(v1)), parseInt(String(v2))] } },
        orderBy: { version: 'asc' },
      })
    } else {
      // Get latest two versions
      versions = await prisma.parameterVersion.findMany({
        where: { parameterId: paramId },
        orderBy: { version: 'desc' },
        take: 2,
      })
      versions.reverse()
    }

    if (versions.length < 2) {
      res.json({ diff: '需要至少两个版本才能对比', versions })
      return
    }

    const oldText = JSON.stringify(versions[0].jsonValue, null, 2)
    const newText = JSON.stringify(versions[1].jsonValue, null, 2)
    const changes = diffLines(oldText, newText)

    res.json({
      versions: versions.map(v => ({ version: v.version, createdAt: v.createdAt })),
      diff: changes.map(c => ({
        added: c.added || false,
        removed: c.removed || false,
        value: c.value,
      })),
    })
  } catch {
    res.status(500).json({ error: '获取差异失败' })
  }
})

export default router
