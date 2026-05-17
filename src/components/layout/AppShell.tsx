"use client"

import { useState } from "react"
import { Sidebar } from "./Sidebar"
import { MobileNav } from "./MobileNav"
import { MobileHeader } from "./MobileHeader"

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* 데스크탑 사이드바 */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* 모바일 사이드바 드로어 */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed left-0 top-0 z-50 h-full lg:hidden animate-slide-in">
            <Sidebar onClose={() => setSidebarOpen(false)} mobile />
          </div>
        </>
      )}

      {/* 메인 콘텐츠 */}
      <div className="lg:ml-56 flex flex-col min-h-screen">
        <MobileHeader onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 pb-20 lg:pb-0">{children}</main>
      </div>

      {/* 모바일 하단 내비게이션 */}
      <MobileNav />
    </div>
  )
}
