"use client"

import { Menu, Zap } from "lucide-react"
import { useSession } from "next-auth/react"
import Image from "next/image"

interface Props {
  onMenuClick: () => void
}

export function MobileHeader({ onMenuClick }: Props) {
  const { data: session } = useSession()

  return (
    <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-[#dadce0] bg-white sticky top-0 z-30">
      <button
        onClick={onMenuClick}
        className="p-2 rounded-full text-[#5f6368] hover:text-[#202124] hover:bg-[#f1f3f4] transition-colors"
        aria-label="메뉴 열기"
      >
        <Menu size={20} />
      </button>

      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
          <Zap size={12} className="text-white" />
        </div>
        <span className="text-[14px] font-semibold text-[#202124]">My Calendar</span>
      </div>

      {session?.user?.image ? (
        <Image
          src={session.user.image}
          alt="프로필"
          width={28}
          height={28}
          className="rounded-full"
        />
      ) : (
        <div className="w-7 h-7" />
      )}
    </header>
  )
}
