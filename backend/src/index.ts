import express from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'

export const prisma = new PrismaClient()

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
app.use(express.json())
app.use('/uploads', express.static('uploads'))

// Route imports
import authRoutes from './routes/auth.js'
import paperRoutes from './routes/papers.js'
import templateRoutes from './routes/templates.js'
import parameterRoutes from './routes/parameters.js'
import libraryRoutes from './routes/library.js'
import qaRoutes from './routes/qa.js'
import dashboardRoutes from './routes/dashboard.js'
import notificationRoutes from './routes/notifications.js'
import auditRoutes from './routes/audit.js'
import { auditMiddleware } from './middleware/audit.js'

// Audit logging (before routes to wrap res.json)
app.use(auditMiddleware)

// Auth routes (no audit needed for login/register)
app.use('/api/auth', authRoutes)

// Protected routes
app.use('/api/papers', paperRoutes)
app.use('/api/templates', templateRoutes)
app.use('/api/parameters', parameterRoutes)
app.use('/api/library', libraryRoutes)
app.use('/api/qa', qaRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/audit', auditRoutes)

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

process.on('SIGTERM', async () => {
  await prisma.$disconnect()
  process.exit(0)
})
