"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, Play } from "lucide-react"
import { Project, CATEGORY_COLORS, CATEGORY_LABELS } from "@/types"

export function StalledProjects({ onResume }: { onResume?: () => void }) {
  const [stalled, setStalled] = useState<Project[]>([])

  useEffect(() => {
    fetch("/api/ai/stalled")
      .then((r) => r.json())
      .then((d) => setStalled(d.projects || []))
      .catch(() => {})
  }, [])

  if (stalled.length === 0) return null

  const resume = async (id: string) => {
    await fetch("/api/projects", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "active" }),
    })
    setStalled((prev) => prev.filter((p) => p.id !== id))
    onResume?.()
  }

  return (
    <div
      className="card animate-in"
      style={{ borderColor: "rgba(245,158,11,0.3)", background: "#fffbeb" }}
    >
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle size={15} className="text-amber-500" />
        <h2 className="text-[14px] font-semibold text-amber-700">
          멈춘 프로젝트 {stalled.length}개 발견
        </h2>
      </div>
      <div className="space-y-2">
        {stalled.map((project) => {
          const color = CATEGORY_COLORS[project.category] || "#6b7280"
          const daysAgo = Math.floor(
            (Date.now() - new Date(project.updatedAt).getTime()) / 86400000
          )
          return (
            <div
              key={project.id}
              className="flex items-center gap-3 py-2.5 px-3 bg-white rounded-lg border border-amber-100"
            >
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-[#202124] font-medium truncate">{project.title}</p>
                <p className="text-[11px] text-[#9aa0a6]">
                  {CATEGORY_LABELS[project.category]} · {project.progress}% 완료
                </p>
              </div>
              <span className="text-[11px] text-amber-600 font-medium flex-shrink-0">{daysAgo}일 전</span>
              <button
                onClick={() => resume(project.id)}
                title="재개하기"
                className="p-1.5 rounded-lg hover:bg-emerald-50 text-[#9aa0a6] hover:text-emerald-600 transition-colors flex-shrink-0"
              >
                <Play size={13} />
              </button>
            </div>
          )
        })}
      </div>
      <p className="text-[12px] text-amber-600 mt-3">
        💡 오늘 하나씩 재개해보는 건 어떨까요?
      </p>
    </div>
  )
}
