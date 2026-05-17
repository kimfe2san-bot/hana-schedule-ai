import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id

  if (!userId) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status")
  const category = searchParams.get("category")

  const ideas = await prisma.idea.findMany({
    where: {
      userId,
      ...(status && { status }),
      ...(category && { category }),
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  return NextResponse.json({ ideas })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id

  if (!userId) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 })
  }

  const body = await req.json()
  const idea = await prisma.idea.create({
    data: {
      title: body.title,
      content: body.content,
      category: body.category || "general",
      status: body.status || "capture",
      userId,
    },
  })

  return NextResponse.json({ idea })
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id

  if (!userId) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 })
  }

  const body = await req.json()
  const idea = await prisma.idea.update({
    where: { id: body.id, userId },
    data: {
      ...(body.status && { status: body.status }),
      ...(body.eventId && { eventId: body.eventId }),
      ...(body.category && { category: body.category }),
    },
  })

  return NextResponse.json({ idea })
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

  await prisma.idea.delete({ where: { id, userId } })
  return NextResponse.json({ success: true })
}
