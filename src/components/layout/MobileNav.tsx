"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Calendar, Lightbulb, FolderOpen } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", label: "홈", icon: LayoutDashboard },
  { href: "/calendar", label: "캘린더", icon: Calendar },
  { href: "/ideas", label: "아이디어", icon: Lightbulb },
  { href: "/projects", label: "프로젝트", icon: FolderOpen },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#dadce0] flex"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname === href
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex-1 flex flex-col items-center gap-1 py-3 transition-colors",
              active ? "text-[#1a73e8]" : "text-[#9aa0a6]"
            )}
          >
            <Icon size={21} strokeWidth={active ? 2.5 : 1.8} />
            <span className={cn("text-[10px]", active ? "font-semibold" : "font-normal")}>
              {label}
            </span>
            {active && (
              <span className="absolute bottom-0 w-5 h-0.5 bg-[#1a73e8] rounded-full" />
            )}
          </Link>
        )
      })}
    </nav>
  )
}
