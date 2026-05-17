import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"
import { getEvents, createEvent, updateEvent, deleteEvent } from "@/lib/google-calendar"
import { authOptions } from "@/lib/auth"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const accessToken = (session as any)?.accessToken

  if (!accessToken) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const now = new Date()
  const timeMin =
    searchParams.get("timeMin") ||
    new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const timeMax =
    searchParams.get("timeMax") ||
    new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString()

  try {
    const events = await getEvents(accessToken, timeMin, timeMax)
    return NextResponse.json({ events })
  } catch (error) {
    console.error("Calendar fetch error:", error)
    return NextResponse.json({ error: "일정을 가져올 수 없습니다" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const accessToken = (session as any)?.accessToken
  if (!accessToken) return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 })
  try {
    const body = await req.json()
    console.log("[POST /api/calendar] body:", JSON.stringify(body))
    const event = await createEvent(accessToken, body)
    console.log("[POST /api/calendar] created:", event.id, event.summary)
    return NextResponse.json({ event })
  } catch (error: any) {
    console.error("[POST /api/calendar] error:", error?.message ?? error)
    const msg = error?.message ?? "일정을 생성할 수 없습니다"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const accessToken = (session as any)?.accessToken
  if (!accessToken) return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 })
  try {
    const { eventId, ...updates } = await req.json()
    const event = await updateEvent(accessToken, eventId, updates)
    return NextResponse.json({ event })
  } catch (error) {
    console.error("Calendar update error:", error)
    return NextResponse.json({ error: "일정을 수정할 수 없습니다" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const accessToken = (session as any)?.accessToken
  if (!accessToken) return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 })
  try {
    const { searchParams } = new URL(req.url)
    const eventId = searchParams.get("eventId")
    if (!eventId) return NextResponse.json({ error: "eventId 필요" }, { status: 400 })
    await deleteEvent(accessToken, eventId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Calendar delete error:", error)
    return NextResponse.json({ error: "일정을 삭제할 수 없습니다" }, { status: 500 })
  }
}
