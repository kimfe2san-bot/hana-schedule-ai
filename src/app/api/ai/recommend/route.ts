import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"
import { getAIRecommendations } from "@/lib/anthropic"
import { prisma } from "@/lib/prisma"
import { getEvents } from "@/lib/google-calendar"
import { formatTime } from "@/lib/utils"
import { authOptions } from "@/lib/auth"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id
  const accessToken = (session as any)?.accessToken

  if (!userId) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 })
  }

  const today = new Date()
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59)

  let events: { summary: string; start: string }[] = []

  if (accessToken) {
    try {
      const calEvents = await getEvents(
        accessToken,
        todayStart.toISOString(),
        todayEnd.toISOString()
      )
      events = calEvents.map((e: any) => ({
        summary: e.summary || "제목 없음",
        start: formatTime(e.start?.dateTime) || e.start?.date || "",
      }))
    } catch {}
  }

  const projects = await prisma.project.findMany({
    where: { userId, status: "active" },
    select: { title: true, category: true, progress: true },
  })

  const ideas = await prisma.idea.findMany({
    where: { userId, status: "capture" },
    select: { title: true, category: true },
    take: 5,
    orderBy: { createdAt: "desc" },
  })

  const recommendations = await getAIRecommendations(events, projects, ideas)
  return NextResponse.json(recommendations)
}
