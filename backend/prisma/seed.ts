import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const adminHash = await bcrypt.hash('admin123', 10)
  const reviewerHash = await bcrypt.hash('review123', 10)
  const userHash = await bcrypt.hash('user123', 10)

  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: { username: 'admin', passwordHash: adminHash, role: 'admin' },
  })

  await prisma.user.upsert({
    where: { username: 'reviewer' },
    update: {},
    create: { username: 'reviewer', passwordHash: reviewerHash, role: 'reviewer' },
  })

  await prisma.user.upsert({
    where: { username: 'user' },
    update: {},
    create: { username: 'user', passwordHash: userHash, role: 'user' },
  })

  console.log('Seed completed: admin/admin123, reviewer/review123, user/user123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
