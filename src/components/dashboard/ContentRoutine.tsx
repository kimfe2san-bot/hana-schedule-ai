"use client"

import { useState } from "react"
import { Film, RefreshCw } from "lucide-react"

interface RoutineDay {
  day: string
  tasks: string[]
  type: "planning" | "filming" | "editing" | "upload" | "business" | "rest"
}

const TYPE_CONFIG = {
  planning: { color: "#a855f7", label: "기획" },
  filming: { color: "#ef4444", label: "촬영" },
  editing: { color: "#f59e0b", label: "편집" },
  upload: { color: "#10b981", label: "업로드" },
  business: { color: "#06b6d4", label: "사업" },
  rest: { color: "#6b7280", label: "회고" },
}

export function ContentRoutine() {
  const [routine, setRoutine] = useState<RoutineDay[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const generate = async () => {
    setLoading(true)
    setExpanded(true)
    try {
      const res = await fetch("/api/ai/content-routine")
      const data = await res.json()
      setRoutine(data.routine)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card animate-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Film size={16} className="text-purple-500" />
          <h2 className="text-[14px] font-semibold text-[#202124]">주간 콘텐츠 루틴</h2>
        </div>
        <button
          onClick={generate}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-lg text-[12px] font-medium transition-colors disabled:opacity-50 border border-purple-100"
        >
          <RefreshCw size={11} className={loading ? "animate-spin" : ""} />
          {routine ? "재생성" : "AI 생성"}
        </button>
      </div>

      {!expanded ? (
        <div className="text-center py-6">
          <p className="text-[13px] text-[#5f6368] mb-1">기획→촬영→편집→업로드 자동 배치</p>
          <p className="text-[12px] text-[#9aa0a6]">내 프로젝트 기반으로 최적 루틴 생성</p>
        </div>
      ) : loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="h-8 bg-[#f1f3f4] rounded animate-pulse" />
          ))}
        </div>
      ) : routine ? (
        <div className="space-y-1.5">
          {routine.map(({ day, tasks, type }) => {
            const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.rest
            return (
              <div key={day} className="flex gap-3 items-start">
                <span className="text-[12px] text-[#5f6368] w-4 pt-1.5 flex-shrink-0 font-medium">
                  {day}
                </span>
                <div className="flex-1 space-y-0.5">
                  {tasks.map((task, i) => (
                    <div
                      key={i}
                      className="text-[12px] py-1.5 px-2.5 rounded-lg flex items-center gap-1.5"
                      style={{ color: cfg.color, background: `${cfg.color}12` }}
                    >
                      <span
                        className="text-[9px] px-1.5 py-0.5 rounded-full flex-shrink-0 font-semibold text-white"
                        style={{ background: cfg.color }}
                      >
                        {cfg.label}
                      </span>
                      {task}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
