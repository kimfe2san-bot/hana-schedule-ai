"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { useEffect, useState } from "react"
import {
  LayoutDashboard,
  Calendar,
  Lightbulb,
  FolderOpen,
  LogOut,
  Zap,
  X,
  Settings2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { CategoryManager } from "@/components/dashboard/CategoryManager"

interface Category {
  id: string
  name: string
  colorId: string
  color: string
}

const navItems = [
  { href: "/", label: "대시보드", icon: LayoutDashboard },
  { href: "/calendar", label: "캘린더", icon: Calendar },
  { href: "/ideas", label: "아이디어", icon: Lightbulb },
  { href: "/projects", label: "프로젝트", icon: FolderOpen },
]

interface Props {
  onClose?: () => void
  mobile?: boolean
}

export function Sidebar({ onClose, mobile }: Props) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [categories, setCategories] = useState<Category[]>([])
  const [showManager, setShowManager] = useState(false)

  const fetchCategories = () => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []))
      .catch(() => {})
  }

  useEffect(() => {
    if (session) fetchCategories()
  }, [session])

  return (
    <>
      <aside className="fixed left-0 top-0 h-full w-56 flex flex-col border-r border-[#dadce0] bg-white z-10">
        {/* 로고 */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-[#dadce0]">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
            <Zap size={14} className="text-white" />
          </div>
          <span className="font-semibold text-[15px] text-[#202124] flex-1">My Calendar</span>
          {mobile && onClose && (
            <button onClick={onClose} className="text-[#9aa0a6] hover:text-[#202124] transition-colors p-1">
              <X size={16} />
            </button>
          )}
        </div>

        {/* 네비게이션 */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-full text-sm transition-colors",
                  active
                    ? "bg-[#e8f0fe] text-[#1967d2] font-medium"
                    : "text-[#5f6368] hover:text-[#202124] hover:bg-[#f1f3f4]"
                )}
              >
                <Icon size={17} />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* 카테고리 색상 범례 */}
        <div className="px-4 py-4 border-t border-[#dadce0]">
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-[11px] text-[#9aa0a6] font-medium uppercase tracking-wider">카테고리</p>
            <button
              onClick={() => setShowManager(true)}
              className="text-[#9aa0a6] hover:text-[#5f6368] transition-colors p-0.5 rounded"
              title="카테고리 관리"
            >
              <Settings2 size={13} />
            </button>
          </div>
          <div className="space-y-2">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cat.color }} />
                <span className="text-[12px] text-[#5f6368] truncate">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 프로필 & 로그아웃 */}
        {session && (
          <div className="px-3 py-3 border-t border-[#dadce0]">
            <div className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-[#f1f3f4] transition-colors">
              {session.user?.image && (
                <Image src={session.user.image} alt="profile" width={28} height={28} className="rounded-full" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-[#202124] truncate font-medium">{session.user?.name}</p>
              </div>
              <button onClick={() => signOut()} className="text-[#9aa0a6] hover:text-[#5f6368] transition-colors" title="로그아웃">
                <LogOut size={14} />
              </button>
            </div>
          </div>
        )}
      </aside>

      {showManager && (
        <CategoryManager
          onClose={() => setShowManager(false)}
          onChanged={fetchCategories}
        />
      )}
    </>
  )
}
