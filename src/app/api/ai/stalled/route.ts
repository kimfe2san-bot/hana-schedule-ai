import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

export async function GET() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id

  if (!userId) return NextResponse.json({ error: "인증 필요" }, { status: 401 })

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const projects = await prisma.project.findMany({
    where: {
      userId,
      status: "active",
      progress: { lt: 100 },
      updatedAt: { lt: sevenDaysAgo },
    },
    orderBy: { updatedAt: "asc" },
  })

  return NextResponse.json({ projects })
}
