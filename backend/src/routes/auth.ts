import { Router, Response } from 'express'
import bcrypt from 'bcryptjs'
import { prisma } from '../index.js'
import { generateToken, requireAuth, requireRole, AuthRequest } from '../middleware/auth.js'

const router = Router()

router.post('/register', async (req: AuthRequest, res: Response) => {
  try {
    const { username, password } = req.body
    if (!username || !password) {
      res.status(400).json({ error: '用户名和密码不能为空' })
      return
    }
    if (password.length < 6) {
      res.status(400).json({ error: '密码长度不能少于6位' })
      return
    }

    const existing = await prisma.user.findUnique({ where: { username } })
    if (existing) {
      res.status(409).json({ error: '用户名已存在' })
      return
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { username, passwordHash, role: 'user' },
    })

    const token = generateToken(user.id, user.role)
    res.status(201).json({ token, user: { id: user.id, username: user.username, role: user.role } })
  } catch {
    res.status(500).json({ error: '注册失败' })
  }
})

router.post('/login', async (req: AuthRequest, res: Response) => {
  try {
    const { username, password } = req.body
    if (!username || !password) {
      res.status(400).json({ error: '用户名和密码不能为空' })
      return
    }

    const user = await prisma.user.findUnique({ where: { username } })
    if (!user) {
      res.status(401).json({ error: '用户名或密码错误' })
      return
    }

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      res.status(401).json({ error: '用户名或密码错误' })
      return
    }

    const token = generateToken(user.id, user.role)
    res.json({ token, user: { id: user.id, username: user.username, role: user.role } })
  } catch {
    res.status(500).json({ error: '登录失败' })
  }
})

router.get('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, username: true, role: true, createdAt: true },
    })
    if (!user) {
      res.status(404).json({ error: '用户不存在' })
      return
    }
    res.json(user)
  } catch {
    res.status(500).json({ error: '获取用户信息失败' })
  }
})

// Admin: List all users
router.get('/users', requireAuth, requireRole('admin'), async (_req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, username: true, role: true, createdAt: true, updatedAt: true },
      orderBy: { createdAt: 'desc' },
    })
    res.json({ users })
  } catch {
    res.status(500).json({ error: '获取用户列表失败' })
  }
})

// Admin: Create user with specific role
router.post('/users', requireAuth, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { username, password, role } = req.body
    if (!username || !password) {
      res.status(400).json({ error: '用户名和密码不能为空' })
      return
    }
    if (password.length < 6) {
      res.status(400).json({ error: '密码长度不能少于6位' })
      return
    }
    const validRoles = ['user', 'reviewer', 'admin']
    if (role && !validRoles.includes(role)) {
      res.status(400).json({ error: '无效的角色' })
      return
    }

    const existing = await prisma.user.findUnique({ where: { username } })
    if (existing) {
      res.status(409).json({ error: '用户名已存在' })
      return
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { username, passwordHash, role: role || 'user' },
      select: { id: true, username: true, role: true, createdAt: true },
    })
    res.status(201).json(user)
  } catch {
    res.status(500).json({ error: '创建用户失败' })
  }
})

// Admin: Update user role
router.patch('/users/:id', requireAuth, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { role } = req.body
    const validRoles = ['user', 'reviewer', 'admin']
    if (!role || !validRoles.includes(role)) {
      res.status(400).json({ error: '无效的角色' })
      return
    }

    const user = await prisma.user.update({
      where: { id: String(req.params.id) },
      data: { role },
      select: { id: true, username: true, role: true, createdAt: true },
    })
    res.json(user)
  } catch {
    res.status(500).json({ error: '更新用户失败' })
  }
})

export default router
