import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`
    const userCount = await prisma.user.count()
    return NextResponse.json({ ok: true, userCount, dbUrl: process.env.DATABASE_URL?.slice(0, 50) + "..." })
  } catch (e: any) {
    return NextResponse.json({
      ok: false,
      error: e.message,
      code: e.code,
      dbUrl: process.env.DATABASE_URL?.slice(0, 60) + "...",
      directUrl: process.env.DIRECT_URL?.slice(0, 60) + "...",
    }, { status: 500 })
  }
}
