import { Router, Response } from 'express'
import { prisma } from '../index.js'
import { requireAuth, AuthRequest } from '../middleware/auth.js'
import { upload } from '../middleware/upload.js'
import { createNotification } from './notifications.js'

const router = Router()

router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { search, status, sort, page, pageSize } = req.query
    const where: any = {}

    if (req.userRole === 'user') {
      where.uploadedById = req.userId
    }

    if (search) {
      where.OR = [
        { filename: { contains: String(search) } },
        { author: { contains: String(search) } },
        { doi: { contains: String(search) } },
      ]
    }
    if (status && status !== 'all') {
      where.status = String(status)
    }

    let orderBy: any = { createdAt: 'desc' }
    if (sort === 'createdAt_asc') orderBy = { createdAt: 'asc' }
    else if (sort === 'extractedCount_desc') orderBy = { extractedCount: 'desc' }
    else if (sort === 'extractedCount_asc') orderBy = { extractedCount: 'asc' }

    const p = Math.max(1, parseInt(String(page || '1')))
    const ps = Math.min(50, Math.max(1, parseInt(String(pageSize || '20'))))

    const [papers, total] = await Promise.all([
      prisma.paper.findMany({ where, orderBy, skip: (p - 1) * ps, take: ps }),
      prisma.paper.count({ where }),
    ])

    res.json({ papers, total, page: p, pageSize: ps, totalPages: Math.ceil(total / ps) })
  } catch {
    res.status(500).json({ error: '获取论文列表失败' })
  }
})

router.get('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const paper = await prisma.paper.findUnique({
      where: { id: String(req.params.id) },
      include: { parameters: true },
    })
    if (!paper) {
      res.status(404).json({ error: '论文不存在' })
      return
    }
    if (req.userRole === 'user' && paper.uploadedById !== req.userId) {
      res.status(403).json({ error: '无权查看此论文' })
      return
    }
    res.json(paper)
  } catch {
    res.status(500).json({ error: '获取论文详情失败' })
  }
})

router.post('/upload', requireAuth, upload.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: '请选择文件' })
      return
    }

    const paper = await prisma.paper.create({
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        filePath: req.file.path,
        fileType: req.file.mimetype,
        status: 'pending',
        uploadedById: req.userId!,
      },
    })

    parsePaper(paper.id, req.file.path, req.file.mimetype).catch(console.error)

    res.status(201).json(paper)
  } catch {
    res.status(500).json({ error: '上传失败' })
  }
})

router.post('/:id/retry', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const paper = await prisma.paper.findUnique({ where: { id: String(req.params.id) } })
    if (!paper) {
      res.status(404).json({ error: '论文不存在' })
      return
    }
    if (paper.status !== 'failed') {
      res.status(400).json({ error: '只能重试解析失败的论文' })
      return
    }

    parsePaper(paper.id, paper.filePath, paper.fileType).catch(console.error)
    res.json({ message: '已开始重新解析' })
  } catch {
    res.status(500).json({ error: '重试失败' })
  }
})

export async function parsePaper(paperId: string, filePath: string, mimeType: string) {
  await prisma.paper.update({ where: { id: paperId }, data: { status: 'parsing' } })

  try {
    let text = ''
    if (mimeType === 'application/pdf') {
      const pdfParse = await import('pdf-parse')
      const fs = await import('fs')
      const buf = fs.readFileSync(filePath)
      const data = await pdfParse.default(buf)
      text = data.text
    } else if (mimeType.includes('officedocument')) {
      const mammoth = await import('mammoth')
      const result = await mammoth.extractRawText({ path: filePath })
      text = result.value
    } else if (mimeType.includes('markdown') || filePath.endsWith('.md')) {
      const fs = await import('fs')
      text = fs.readFileSync(filePath, 'utf-8')
    }

    const authorMatch = text.match(/(?:Author|作者)[：:]\s*([^\n]+)/i)
    const doiMatch = text.match(/10\.\d{4,9}\/[-._;()/:A-Z0-9]+/i)

    const updated = await prisma.paper.update({
      where: { id: paperId },
      data: {
        status: 'parsed',
        content: text.slice(0, 50000),
        author: authorMatch?.[1]?.trim() || null,
        doi: doiMatch?.[0] || null,
      },
    })

    await createNotification(updated.uploadedById, 'parse_complete', `论文「${updated.filename}」解析完成`)
  } catch {
    const failed = await prisma.paper.update({ where: { id: paperId }, data: { status: 'failed' } })
    await createNotification(failed.uploadedById, 'parse_failed', `论文「${failed.filename}」解析失败，可重试`)
  }
}

export default router
