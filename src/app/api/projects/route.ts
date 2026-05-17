import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

export async function GET() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id

  if (!userId) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 })
  }

  const projects = await prisma.project.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  })

  return NextResponse.json({ projects })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id

  if (!userId) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 })
  }

  const body = await req.json()

  const colorMap: Record<string, string> = {
    content: "#10b981",
    business: "#f59e0b",
    ai: "#06b6d4",
    marketing: "#a855f7",
  }

  const project = await prisma.project.create({
    data: {
      title: body.title,
      description: body.description,
      category: body.category || "content",
      status: "active",
      progress: 0,
      color: colorMap[body.category] || "#10b981",
      userId,
    },
  })

  return NextResponse.json({ project })
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id

  if (!userId) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 })
  }

  const body = await req.json()
  const project = await prisma.project.update({
    where: { id: body.id, userId },
    data: {
      ...(body.progress !== undefined && { progress: body.progress }),
      ...(body.status && { status: body.status }),
      ...(body.title && { title: body.title }),
      ...(body.description !== undefined && { description: body.description }),
    },
  })

  return NextResponse.json({ project })
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id

  if (!userId) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "ID 없음" }, { status: 400 })

  await prisma.project.delete({ where: { id, userId } })
  return NextResponse.json({ success: true })
}
