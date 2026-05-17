import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id
  if (!userId) return NextResponse.json({ error: "인증 필요" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const date = searchParams.get("date") || todayStr()

  const todos = await prisma.todo.findMany({
    where: { userId, date },
    orderBy: { createdAt: "asc" },
  })
  return NextResponse.json({ todos })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id
  if (!userId) return NextResponse.json({ error: "인증 필요" }, { status: 401 })

  const { text, date } = await req.json()
  if (!text?.trim()) return NextResponse.json({ error: "내용 필요" }, { status: 400 })

  try {
    const todo = await prisma.todo.create({
      data: { text: text.trim(), date: date || todayStr(), userId },
    })
    return NextResponse.json({ todo })
  } catch (e: any) {
    console.error("[POST /api/todos]", e?.message ?? e)
    return NextResponse.json({ error: e?.message ?? "저장 실패" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id
  if (!userId) return NextResponse.json({ error: "인증 필요" }, { status: 401 })

  const { id, done, text } = await req.json()
  const todo = await prisma.todo.update({
    where: { id, userId },
    data: { ...(done !== undefined && { done }), ...(text && { text }) },
  })
  return NextResponse.json({ todo })
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id
  if (!userId) return NextResponse.json({ error: "인증 필요" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id 필요" }, { status: 400 })

  await prisma.todo.delete({ where: { id, userId } })
  return NextResponse.json({ success: true })
}
