"use client"

import { useEffect, useState } from "react"
import { Sparkles, ChevronRight, Clock, Loader2 } from "lucide-react"

interface AIRecommendation {
  focus: string[]
  blocks: string[]
  tip: string
}

export function TodayFocus() {
  const [data, setData] = useState<AIRecommendation | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/ai/recommend")
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() =>
        setData({
          focus: ["유튜브 스크립트 작성", "건강식품 마케팅 기획", "AI 자동화 테스트"],
          blocks: ["오전 9-11시: 창작 집중", "오후 2-4시: 사업 처리"],
          tip: "오전 시간을 창의적인 작업에 배치하세요.",
        })
      )
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="card animate-in">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={16} className="text-amber-500" />
        <h2 className="text-[14px] font-semibold text-[#202124]">AI 오늘의 핵심</h2>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 size={18} className="animate-spin text-[#dadce0]" />
        </div>
      ) : (
        <div className="space-y-4">
          {/* 핵심 3 */}
          <div className="space-y-2">
            {data?.focus.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 bg-[#f8f9fa] rounded-lg border border-[#dadce0] hover:border-[#bdc1c6] hover:bg-[#f1f3f4] transition-colors"
              >
                <span className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                  {i + 1}
                </span>
                <span className="text-[13px] text-[#202124] flex-1">{item}</span>
                <ChevronRight size={12} className="text-[#9aa0a6]" />
              </div>
            ))}
          </div>

          {/* 집중 블록 */}
          <div className="pt-3 border-t border-[#e8eaed]">
            <p className="text-[11px] text-[#9aa0a6] mb-2 font-medium uppercase tracking-wider flex items-center gap-1">
              <Clock size={10} /> 추천 집중 블록
            </p>
            <div className="space-y-1">
              {data?.blocks.map((block, i) => (
                <p key={i} className="text-[13px] text-[#5f6368]">
                  • {block}
                </p>
              ))}
            </div>
          </div>

          {/* 에너지 팁 */}
          {data?.tip && (
            <div className="pt-3 border-t border-[#e8eaed]">
              <p className="text-[12px] text-[#5f6368] leading-relaxed">
                💡 {data.tip}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
