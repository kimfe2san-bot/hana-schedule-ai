"use client"

import { useState, useEffect } from "react"
import { X, Plus, Trash2, Check } from "lucide-react"

interface Category {
  id: string
  name: string
  colorId: string
  color: string
}

const COLOR_OPTIONS = [
  { colorId: "11", color: "#d50000" },
  { colorId: "4",  color: "#e67c73" },
  { colorId: "6",  color: "#f4511e" },
  { colorId: "5",  color: "#f6bf26" },
  { colorId: "2",  color: "#33b679" },
  { colorId: "10", color: "#0b8043" },
  { colorId: "7",  color: "#039be5" },
  { colorId: "9",  color: "#3f51b5" },
  { colorId: "1",  color: "#7986cb" },
  { colorId: "3",  color: "#8e24aa" },
  { colorId: "8",  color: "#616161" },
]

interface Props {
  onClose: () => void
  onChanged: () => void
}

export function CategoryManager({ onClose, onChanged }: Props) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editColorId, setEditColorId] = useState("")
  const [editColor, setEditColor] = useState("")
  const [newName, setNewName] = useState("")
  const [newColorId, setNewColorId] = useState("8")
  const [newColor, setNewColor] = useState("#616161")
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onClose])

  const startEdit = (cat: Category) => {
    setEditing(cat.id)
    setEditName(cat.name)
    setEditColorId(cat.colorId)
    setEditColor(cat.color)
  }

  const saveEdit = async (id: string) => {
    if (!editName.trim()) return
    const res = await fetch("/api/categories", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, name: editName.trim(), colorId: editColorId, color: editColor }),
    })
    const data = await res.json()
    if (data.category) {
      setCategories((prev) => prev.map((c) => c.id === id ? data.category : c))
      setEditing(null)
      onChanged()
    }
  }

  const deleteCategory = async (id: string) => {
    const res = await fetch(`/api/categories?id=${id}`, { method: "DELETE" })
    const data = await res.json()
    if (data.success) {
      setCategories((prev) => prev.filter((c) => c.id !== id))
      onChanged()
    } else {
      alert(data.error || "삭제 실패")
    }
  }

  const addCategory = async () => {
    if (!newName.trim()) return
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim(), colorId: newColorId, color: newColor }),
    })
    const data = await res.json()
    if (data.category) {
      setCategories((prev) => [...prev, data.category])
      setNewName("")
      setNewColorId("8")
      setNewColor("#616161")
      setAdding(false)
      onChanged()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-[#dadce0] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#dadce0]">
          <h2 className="text-[14px] font-semibold text-[#202124]">카테고리 관리</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full text-[#9aa0a6] hover:bg-[#f1f3f4] transition-colors">
            <X size={14} />
          </button>
        </div>

        <div className="px-4 py-3 space-y-1 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="py-6 text-center text-[13px] text-[#9aa0a6]">로딩 중...</div>
          ) : (
            <>
              {categories.map((cat) => (
                <div key={cat.id}>
                  {editing === cat.id ? (
                    <div className="p-3 bg-[#f8f9fa] rounded-xl space-y-3">
                      <input
                        autoFocus
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && saveEdit(cat.id)}
                        className="w-full text-[13px] px-3 py-2 rounded-lg border border-[#dadce0] outline-none focus:border-[#1a73e8] bg-white text-[#202124]"
                        placeholder="카테고리 이름"
                      />
                      <div className="flex gap-1.5 flex-wrap">
                        {COLOR_OPTIONS.map((opt) => (
                          <button
                            key={opt.colorId}
                            onClick={() => { setEditColorId(opt.colorId); setEditColor(opt.color) }}
                            className="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-transform hover:scale-110"
                            style={{
                              backgroundColor: opt.color,
                              borderColor: editColorId === opt.colorId ? "#202124" : "transparent",
                            }}
                          >
                            {editColorId === opt.colorId && <Check size={10} className="text-white" strokeWidth={3} />}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveEdit(cat.id)}
                          className="flex-1 py-1.5 text-[12px] font-medium rounded-lg bg-[#1a73e8] text-white hover:bg-[#1557b0] transition-colors"
                        >
                          저장
                        </button>
                        <button
                          onClick={() => setEditing(null)}
                          className="flex-1 py-1.5 text-[12px] font-medium rounded-lg border border-[#dadce0] text-[#5f6368] hover:bg-[#f1f3f4] transition-colors"
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="group flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-[#f8f9fa] transition-colors">
                      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                      <span className="flex-1 text-[13px] text-[#202124]">{cat.name}</span>
                      <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                        <button
                          onClick={() => startEdit(cat)}
                          className="text-[11px] px-2 py-1 rounded-lg text-[#5f6368] hover:bg-[#e8eaed] transition-colors"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => deleteCategory(cat.id)}
                          className="text-[#9aa0a6] hover:text-red-500 p-1 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* 새 카테고리 추가 */}
              {adding ? (
                <div className="p-3 bg-[#f8f9fa] rounded-xl space-y-3 mt-2">
                  <input
                    autoFocus
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addCategory()}
                    className="w-full text-[13px] px-3 py-2 rounded-lg border border-[#dadce0] outline-none focus:border-[#1a73e8] bg-white text-[#202124]"
                    placeholder="새 카테고리 이름"
                  />
                  <div className="flex gap-1.5 flex-wrap">
                    {COLOR_OPTIONS.map((opt) => (
                      <button
                        key={opt.colorId}
                        onClick={() => { setNewColorId(opt.colorId); setNewColor(opt.color) }}
                        className="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-transform hover:scale-110"
                        style={{
                          backgroundColor: opt.color,
                          borderColor: newColorId === opt.colorId ? "#202124" : "transparent",
                        }}
                      >
                        {newColorId === opt.colorId && <Check size={10} className="text-white" strokeWidth={3} />}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={addCategory}
                      className="flex-1 py-1.5 text-[12px] font-medium rounded-lg bg-[#1a73e8] text-white hover:bg-[#1557b0] transition-colors"
                    >
                      추가
                    </button>
                    <button
                      onClick={() => { setAdding(false); setNewName("") }}
                      className="flex-1 py-1.5 text-[12px] font-medium rounded-lg border border-[#dadce0] text-[#5f6368] hover:bg-[#f1f3f4] transition-colors"
                    >
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setAdding(true)}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-[13px] text-[#5f6368] hover:bg-[#f8f9fa] transition-colors mt-1"
                >
                  <Plus size={14} />
                  카테고리 추가
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
