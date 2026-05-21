import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import crypto from "crypto"

const prisma = new PrismaClient()

async function seed() {
  const username = "admin"
  const password = process.env.ADMIN_PASSWORD || crypto.randomBytes(16).toString("hex")

  const existing = await prisma.adminUser.findUnique({ where: { username } })
  if (existing) {
    console.log("Admin user already exists")
    return
  }

  const hash = await bcrypt.hash(password, 10)
  await prisma.adminUser.create({
    data: { username, passwordHash: hash },
  })

  console.log("Admin user created:")
  console.log(`  Username: ${username}`)
  console.log(`  Password: ${password}`)
  console.log("  Save this password — it will not be shown again.")
}

seed()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
