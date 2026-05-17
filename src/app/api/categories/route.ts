import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const DEFAULTS = [
  { name: "콘텐츠/유튜브", colorId: "10", color: "#0b8043", ord: 0 },
  { name: "사업",          colorId: "6",  color: "#f4511e", ord: 1 },
  { name: "AI 자동화",     colorId: "7",  color: "#039be5", ord: 2 },
  { name: "마케팅",        colorId: "3",  color: "#8e24aa", ord: 3 },
  { name: "일반",          colorId: "8",  color: "#616161", ord: 4 },
]

async function getOrSeedCategories(userId: string) {
  const existing = await prisma.category.findMany({
    where: { userId },
    orderBy: { ord: "asc" },
  })
  if (existing.length > 0) return existing

  await prisma.category.createMany({
    data: DEFAULTS.map((d) => ({ ...d, userId })),
  })
  return prisma.category.findMany({ where: { userId }, orderBy: { ord: "asc" } })
}

export async function GET() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id
  if (!userId) return NextResponse.json({ error: "인증 필요" }, { status: 401 })

  const categories = await getOrSeedCategories(userId)
  return NextResponse.json({ categories })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id
  if (!userId) return NextResponse.json({ error: "인증 필요" }, { status: 401 })

  const { name, colorId, color } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: "이름 필요" }, { status: 400 })

  const count = await prisma.category.count({ where: { userId } })
  const category = await prisma.category.create({
    data: { name: name.trim(), colorId, color, ord: count, userId },
  })
  return NextResponse.json({ category })
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id
  if (!userId) return NextResponse.json({ error: "인증 필요" }, { status: 401 })

  const { id, name, colorId, color } = await req.json()
  const category = await prisma.category.update({
    where: { id, userId },
    data: { ...(name && { name }), ...(colorId && { colorId }), ...(color && { color }) },
  })
  return NextResponse.json({ category })
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id
  if (!userId) return NextResponse.json({ error: "인증 필요" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id 필요" }, { status: 400 })

  const count = await prisma.category.count({ where: { userId } })
  if (count <= 1) return NextResponse.json({ error: "최소 1개 필요" }, { status: 400 })

  await prisma.category.delete({ where: { id, userId } })
  return NextResponse.json({ success: true })
}
