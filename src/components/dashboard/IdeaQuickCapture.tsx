"use client"

import { useState } from "react"
import { Lightbulb, Send, Check } from "lucide-react"
import { IdeaCategory, CATEGORY_LABELS, CATEGORY_COLORS } from "@/types"

const CATEGORIES: IdeaCategory[] = ["youtube", "business", "ai", "marketing", "general"]

export function IdeaQuickCapture({ onSaved }: { onSaved?: () => void }) {
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState<IdeaCategory>("general")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    if (!title.trim()) return
    setSaving(true)
    try {
      await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), category }),
      })
      setTitle("")
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      onSaved?.()
    } finally {
      setSaving(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSave()
    }
  }

  return (
    <div className="card animate-in">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb size={16} className="text-orange-500" />
        <h2 className="text-[14px] font-semibold text-[#202124]">아이디어 캡처</h2>
        <span className="text-[11px] text-[#9aa0a6]">↵ Enter로 저장</span>
      </div>

      {/* 카테고리 선택 */}
      <div className="flex gap-1.5 mb-3 flex-wrap">
        {CATEGORIES.map((cat) => {
          const color = CATEGORY_COLORS[cat]
          const active = category === cat
          return (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className="text-[12px] px-3 py-1 rounded-full border transition-all"
              style={{
                borderColor: active ? color : "#dadce0",
                color: active ? color : "#5f6368",
                background: active ? `${color}15` : "transparent",
              }}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          )
        })}
      </div>

      {/* 입력창 */}
      <div className="flex gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="지금 떠오른 아이디어를 입력하세요..."
          className="flex-1 bg-[#f8f9fa] border border-[#dadce0] rounded-lg px-3 py-2.5 text-[13px] text-[#202124] placeholder-[#9aa0a6] outline-none focus:border-[#1a73e8] focus:bg-white transition-colors"
        />
        <button
          onClick={handleSave}
          disabled={!title.trim() || saving}
          className="px-3 py-2.5 rounded-lg text-white transition-all disabled:opacity-30 flex items-center gap-1"
          style={{
            background: saved ? "#10b981" : CATEGORY_COLORS[category],
          }}
        >
          {saved ? <Check size={14} /> : <Send size={14} />}
        </button>
      </div>
    </div>
  )
}
