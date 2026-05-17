"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { AppShell } from "@/components/layout/AppShell"
import { IdeaQuickCapture } from "@/components/dashboard/IdeaQuickCapture"
import { Idea, IdeaCategory, IdeaStatus, CATEGORY_COLORS, CATEGORY_LABELS } from "@/types"
import { Trash2, Archive, Calendar, CheckCircle } from "lucide-react"

const STATUS_TABS: { value: IdeaStatus | "all"; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "capture", label: "캡처됨" },
  { value: "later", label: "나중에" },
  { value: "scheduled", label: "일정등록" },
  { value: "done", label: "완료" },
]

const CATEGORY_FILTERS: { value: IdeaCategory | "all"; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "youtube", label: "유튜브" },
  { value: "business", label: "사업" },
  { value: "ai", label: "AI" },
  { value: "marketing", label: "마케팅" },
  { value: "general", label: "일반" },
]

export default function IdeasPage() {
  const { data: session } = useSession({ required: true })
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(true)
  const [activeStatus, setActiveStatus] = useState<IdeaStatus | "all">("capture")
  const [activeCategory, setActiveCategory] = useState<IdeaCategory | "all">("all")
  const [refresh, setRefresh] = useState(0)

  const fetchIdeas = () => {
    const params = new URLSearchParams()
    if (activeStatus !== "all") params.set("status", activeStatus)
    if (activeCategory !== "all") params.set("category", activeCategory)
    fetch(`/api/ideas?${params}`)
      .then((r) => r.json())
      .then((d) => setIdeas(d.ideas || []))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (session) fetchIdeas()
  }, [session, activeStatus, activeCategory, refresh])

  const updateStatus = async (id: string, status: IdeaStatus) => {
    await fetch("/api/ideas", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    })
    setRefresh((n) => n + 1)
  }

  const deleteIdea = async (id: string) => {
    await fetch(`/api/ideas?id=${id}`, { method: "DELETE" })
    setIdeas((prev) => prev.filter((i) => i.id !== id))
  }

  return (
    <AppShell>
      <div className="p-4 lg:p-8 max-w-3xl">
        <div className="mb-6">
          <h1 className="text-lg lg:text-xl font-bold text-[#202124]">아이디어</h1>
          <p className="text-[#9aa0a6] text-xs lg:text-sm mt-0.5">
            아이디어 → 일정 → 실행 흐름 관리
          </p>
        </div>

        <div className="mb-5">
          <IdeaQuickCapture onSaved={() => setRefresh((n) => n + 1)} />
        </div>

        {/* 상태 필터 */}
        <div className="overflow-x-auto pb-1 mb-3">
          <div className="flex gap-1 bg-white border border-[#dadce0] rounded-lg p-1 w-fit shadow-sm">
            {STATUS_TABS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setActiveStatus(value)}
                className={`px-3 py-1.5 rounded-md text-[12px] font-medium whitespace-nowrap transition-colors ${
                  activeStatus === value
                    ? "bg-[#e8f0fe] text-[#1967d2]"
                    : "text-[#5f6368] hover:text-[#202124] hover:bg-[#f1f3f4]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* 카테고리 필터 */}
        <div className="overflow-x-auto pb-1 mb-5">
          <div className="flex gap-1 bg-white border border-[#dadce0] rounded-lg p-1 w-fit shadow-sm">
            {CATEGORY_FILTERS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setActiveCategory(value)}
                className={`px-3 py-1.5 rounded-md text-[12px] font-medium whitespace-nowrap transition-colors ${
                  activeCategory === value
                    ? "bg-[#e8f0fe] text-[#1967d2]"
                    : "text-[#5f6368] hover:text-[#202124] hover:bg-[#f1f3f4]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 bg-[#f1f3f4] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : ideas.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[#9aa0a6] text-sm">아이디어가 없습니다</p>
          </div>
        ) : (
          <div className="space-y-2">
            {ideas.map((idea) => {
              const color = CATEGORY_COLORS[idea.category] || "#6b7280"
              return (
                <div
                  key={idea.id}
                  className="group flex items-center gap-3 px-4 py-3.5 bg-white border border-[#dadce0] rounded-xl hover:shadow-sm hover:border-[#bdc1c6] transition-all"
                >
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] text-[#202124] font-medium">{idea.title}</p>
                    {idea.content && (
                      <p className="text-[12px] text-[#9aa0a6] mt-0.5 truncate">{idea.content}</p>
                    )}
                  </div>
                  <span
                    className="text-[11px] px-2 py-0.5 rounded-full flex-shrink-0 hidden sm:inline font-medium"
                    style={{ color, background: `${color}15` }}
                  >
                    {CATEGORY_LABELS[idea.category]}
                  </span>
                  <div className="flex gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    {idea.status !== "scheduled" && (
                      <button
                        onClick={() => updateStatus(idea.id, "scheduled")}
                        title="일정으로 등록"
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-[#9aa0a6] hover:text-[#1a73e8] transition-colors"
                      >
                        <Calendar size={14} />
                      </button>
                    )}
                    {idea.status !== "later" && (
                      <button
                        onClick={() => updateStatus(idea.id, "later")}
                        title="나중에"
                        className="p-1.5 rounded-lg hover:bg-[#f1f3f4] text-[#9aa0a6] hover:text-[#5f6368] transition-colors"
                      >
                        <Archive size={14} />
                      </button>
                    )}
                    {idea.status !== "done" && (
                      <button
                        onClick={() => updateStatus(idea.id, "done")}
                        title="완료"
                        className="p-1.5 rounded-lg hover:bg-emerald-50 text-[#9aa0a6] hover:text-emerald-600 transition-colors"
                      >
                        <CheckCircle size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => deleteIdea(idea.id)}
                      title="삭제"
                      className="p-1.5 rounded-lg hover:bg-red-50 text-[#9aa0a6] hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </AppShell>
  )
}
