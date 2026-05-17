"use client"

import { signIn } from "next-auth/react"
import { Zap } from "lucide-react"

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
      <div className="w-full max-w-sm mx-auto px-6">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 mb-5 shadow-lg">
            <Zap size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#202124] mb-2">My Calendar</h1>
          <p className="text-[#5f6368] text-sm">
            콘텐츠 제작자를 위한 AI 일정관리
          </p>
        </div>

        <div className="bg-white border border-[#dadce0] rounded-2xl p-8 shadow-sm">
          <h2 className="text-lg font-semibold text-[#202124] mb-2">로그인</h2>
          <p className="text-[#5f6368] text-sm mb-6">
            Google 계정으로 로그인하면 Google Calendar와 자동으로 연동됩니다.
          </p>

          <button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="w-full flex items-center justify-center gap-3 bg-white text-[#202124] border border-[#dadce0] rounded-xl py-3 px-4 font-medium text-sm hover:bg-[#f8f9fa] hover:shadow-sm transition-all shadow-sm"
          >
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google로 계속하기
          </button>

          <div className="mt-6 text-center">
            <p className="text-[11px] text-[#9aa0a6]">
              로그인 시 Google Calendar 접근 권한이 요청됩니다.
              <br />
              일정 읽기/쓰기에 사용됩니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
