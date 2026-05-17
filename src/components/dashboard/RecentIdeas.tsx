"use client"

import { useEffect, useState } from "react"
import { Lightbulb, Archive, Calendar, ChevronRight } from "lucide-react"
import { Idea, CATEGORY_COLORS, CATEGORY_LABELS } from "@/types"
import Link from "next/link"

export function RecentIdeas({ refresh }: { refresh?: number }) {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(true)

  const fetchIdeas = () => {
    fetch("/api/ideas?status=capture")
      .then((r) => r.json())
      .then((d) => setIdeas(d.ideas?.slice(0, 6) || []))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchIdeas()
  }, [refresh])

  const updateStatus = async (id: string, status: string) => {
    await fetch("/api/ideas", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    })
    setIdeas((prev) => prev.filter((i) => i.id !== id))
  }

  return (
    <div className="card animate-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Lightbulb size={16} className="text-orange-500" />
          <h2 className="text-[14px] font-semibold text-[#202124]">최근 아이디어</h2>
        </div>
        <Link
          href="/ideas"
          className="text-[12px] text-[#1a73e8] hover:text-[#1557b0] flex items-center gap-1 font-medium"
        >
          전체 보기 <ChevronRight size={11} />
        </Link>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-10 bg-[#f1f3f4] rounded-lg animate-pulse" />
          ))}
        </div>
      ) : ideas.length === 0 ? (
        <p className="text-[13px] text-[#9aa0a6] text-center py-6">
          캡처된 아이디어 없음
        </p>
      ) : (
        <div className="space-y-1">
          {ideas.map((idea) => {
            const color = CATEGORY_COLORS[idea.category] || "#6b7280"
            return (
              <div
                key={idea.id}
                className="group flex items-center gap-2.5 py-2.5 px-3 rounded-lg hover:bg-[#f1f3f4] transition-colors"
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: color }}
                />
                <span className="text-[13px] text-[#202124] flex-1 truncate">
                  {idea.title}
                </span>
                <span className="text-[11px] text-[#9aa0a6]">
                  {CATEGORY_LABELS[idea.category]}
                </span>
                <div className="opacity-0 group-hover:opacity-100 flex gap-1.5 transition-opacity">
                  <button
                    onClick={() => updateStatus(idea.id, "scheduled")}
                    title="일정으로 등록"
                    className="text-[#1a73e8] hover:text-[#1557b0]"
                  >
                    <Calendar size={13} />
                  </button>
                  <button
                    onClick={() => updateStatus(idea.id, "later")}
                    title="나중에 보기"
                    className="text-[#9aa0a6] hover:text-[#5f6368]"
                  >
                    <Archive size={13} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
