"use client"

import { useSession, signIn } from "next-auth/react"
import { AppShell } from "@/components/layout/AppShell"
import { IdeaQuickCapture } from "@/components/dashboard/IdeaQuickCapture"
import { CalendarWidget } from "@/components/dashboard/CalendarWidget"
import { RecentIdeas } from "@/components/dashboard/RecentIdeas"
import { TodoList } from "@/components/dashboard/TodoList"
import { getGreeting } from "@/lib/utils"
import { useState } from "react"
import { Zap } from "lucide-react"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [ideaRefresh, setIdeaRefresh] = useState(0)

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
        <div className="w-6 h-6 border-2 border-[#dadce0] border-t-[#1a73e8] rounded-full animate-spin" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f9fa] px-6">
        <div className="text-center max-w-sm w-full">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 mb-6 shadow-lg">
            <Zap size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#202124] mb-2">My Calendar</h1>
          <p className="text-[#5f6368] text-sm mb-2">
            콘텐츠 제작자를 위한 AI 일정관리 시스템
          </p>
          <p className="text-[#9aa0a6] text-xs mb-8">
            Google Calendar 연동 · 모든 기기 동기화 · AI 일정 추천
          </p>
          <button
            onClick={() => signIn("google")}
            className="w-full flex items-center justify-center gap-3 bg-white text-[#202124] border border-[#dadce0] rounded-xl py-3.5 px-4 font-medium text-sm hover:bg-[#f8f9fa] hover:shadow-sm transition-all shadow-sm"
          >
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google로 시작하기
          </button>
          <p className="text-[11px] text-[#9aa0a6] mt-4">
            PC · 스마트폰 · 태블릿 어디서든 접속 가능
          </p>
        </div>
      </div>
    )
  }

  const today = new Date()
  const dateStr = today.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  })

  return (
    <AppShell>
      <div className="p-4 lg:p-8 max-w-[1200px]">
        {/* 헤더 */}
        <div className="mb-6">
          <p className="text-[#9aa0a6] text-xs lg:text-sm mb-1">{dateStr}</p>
          <h1 className="text-xl lg:text-2xl font-bold text-[#202124]">
            {getGreeting()},{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              {session.user?.name?.split(" ")[0]}
            </span>{" "}
            👋
          </h1>
        </div>

        {/* 상단 2열: 이번 주 일정 + 오늘의 할 일 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <CalendarWidget />
          <TodoList />
        </div>

        {/* 아이디어 캡처 */}
        <div className="mb-4">
          <IdeaQuickCapture onSaved={() => setIdeaRefresh((n) => n + 1)} />
        </div>

        {/* 최근 아이디어 */}
        <RecentIdeas refresh={ideaRefresh} />
      </div>
    </AppShell>
  )
}
