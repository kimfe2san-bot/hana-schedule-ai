"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"

interface Category {
  id: string
  name: string
  colorId: string
  color: string
}

interface Props {
  defaultDate?: Date
  editEvent?: import("@/types").CalendarEvent
  onClose: () => void
  onCreated: () => void
}

function dateToLocalInput(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function addOneHour(timeStr: string, dateStr: string): { time: string; date: string } {
  const [h, m] = timeStr.split(":").map(Number)
  const newH = h + 1
  if (newH >= 24) {
    const d = new Date(dateStr)
    d.setDate(d.getDate() + 1)
    return { time: `${String(newH - 24).padStart(2, "0")}:${String(m).padStart(2, "0")}`, date: dateToLocalInput(d) }
  }
  return { time: `${String(newH).padStart(2, "0")}:${String(m).padStart(2, "0")}`, date: dateStr }
}

export function CreateEventModal({ defaultDate, editEvent, onClose, onCreated }: Props) {
  const isEdit = !!editEvent

  const [categories, setCategories] = useState<Category[]>([])
  const [title, setTitle] = useState(editEvent?.summary ?? "")

  const [startDate, setStartDate] = useState(() => {
    if (editEvent?.start.dateTime) return editEvent.start.dateTime.slice(0, 10)
    if (editEvent?.start.date) return editEvent.start.date
    return defaultDate ? dateToLocalInput(defaultDate) : dateToLocalInput(new Date())
  })

  const [endDate, setEndDate] = useState(() => {
    if (editEvent?.end.dateTime) return editEvent.end.dateTime.slice(0, 10)
    if (editEvent?.end.date) {
      const d = new Date(editEvent.end.date)
      d.setDate(d.getDate() - 1)
      return dateToLocalInput(d)
    }
    if (editEvent?.start.dateTime) return editEvent.start.dateTime.slice(0, 10)
    if (editEvent?.start.date) return editEvent.start.date
    return defaultDate ? dateToLocalInput(defaultDate) : dateToLocalInput(new Date())
  })

  const [startTime, setStartTime] = useState(() =>
    editEvent?.start.dateTime ? editEvent.start.dateTime.slice(11, 16) : "09:00"
  )
  const [endTime, setEndTime] = useState(() =>
    editEvent?.end.dateTime ? editEvent.end.dateTime.slice(11, 16) : "10:00"
  )
  // selectedColorId: matches editEvent's colorId or falls back to first category
  const [selectedColorId, setSelectedColorId] = useState(editEvent?.colorId ?? "")
  const [allDay, setAllDay] = useState(!!editEvent?.start.date)
  const [description, setDescription] = useState(editEvent?.description ?? "")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => {
        const cats: Category[] = d.categories || []
        setCategories(cats)
        // If no colorId set yet (new event), default to first category
        if (!selectedColorId && cats.length > 0) {
          setSelectedColorId(cats[0].colorId)
        }
      })
  }, [])

  useEffect(() => {
    if (endDate < startDate) setEndDate(startDate)
  }, [startDate])

  useEffect(() => {
    const { time, date } = addOneHour(startTime, startDate)
    setEndTime(time)
    setEndDate(date)
  }, [startTime])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onClose])

  const handleSubmit = async () => {
    if (!title.trim() || !startDate) return
    setSaving(true)
    setError("")
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone

    let body: Record<string, unknown>
    if (allDay) {
      const endExclusive = new Date(endDate)
      endExclusive.setDate(endExclusive.getDate() + 1)
      body = {
        summary: title,
        description,
        start: { date: startDate },
        end: { date: dateToLocalInput(endExclusive) },
        colorId: selectedColorId || undefined,
      }
    } else {
      body = {
        summary: title,
        description,
        start: { dateTime: `${startDate}T${startTime}:00`, timeZone: tz },
        end:   { dateTime: `${endDate}T${endTime}:00`,   timeZone: tz },
        colorId: selectedColorId || undefined,
      }
    }

    try {
      const res = isEdit
        ? await fetch("/api/calendar", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ eventId: editEvent!.id, ...body }),
          })
        : await fetch("/api/calendar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || `오류 (${res.status})`)
        setSaving(false)
        return
      }

      onCreated()
      onClose()
    } catch {
      setError("네트워크 오류가 발생했습니다")
      setSaving(false)
    }
  }

  const selectedCat = categories.find((c) => c.colorId === selectedColorId)
  const headerColor = selectedCat?.color ?? "#1a73e8"
  const inputCls = "w-full text-[13px] outline-none transition-colors rounded-lg px-3 py-2 bg-[#f8f9fa] border border-[#dadce0] text-[#202124] focus:border-[#1a73e8] focus:bg-white"

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-[400px] rounded-2xl animate-in overflow-hidden bg-white border border-[#dadce0] shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#dadce0]">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: headerColor }} />
            <span className="text-[14px] font-semibold text-[#202124]">{isEdit ? "일정 수정" : "새 일정"}</span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full text-[#9aa0a6] hover:bg-[#f1f3f4] hover:text-[#202124] transition-colors"
          >
            <X size={14} strokeWidth={2} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Title */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && title.trim() && handleSubmit()}
            placeholder="일정 제목을 입력하세요"
            autoFocus
            className="w-full bg-transparent text-[16px] font-medium outline-none border-none text-[#202124] placeholder-[#9aa0a6]"
          />

          {/* Category pills */}
          {categories.length > 0 && (
            <div className="flex gap-1.5 flex-wrap">
              {categories.map((cat) => {
                const active = selectedColorId === cat.colorId
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedColorId(cat.colorId)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all"
                    style={active ? {
                      background: cat.color + "18",
                      border: `1px solid ${cat.color}60`,
                      color: cat.color,
                    } : {
                      background: "transparent",
                      border: "1px solid #dadce0",
                      color: "#5f6368",
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.color }} />
                    {cat.name}
                  </button>
                )
              })}
            </div>
          )}

          <div className="border-t border-[#e8eaed]" />

          {/* All-day toggle */}
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-medium text-[#5f6368]">종일 일정</span>
            <button
              onClick={() => setAllDay(!allDay)}
              className="flex items-center gap-1.5 text-[11px] flex-shrink-0 transition-colors font-medium"
              style={{ color: allDay ? "#1a73e8" : "#9aa0a6" }}
            >
              <div
                className="w-8 h-4 rounded-full relative transition-colors flex-shrink-0"
                style={{ background: allDay ? "#1a73e8" : "#dadce0" }}
              >
                <div
                  className="absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-transform"
                  style={{ transform: allDay ? "translateX(16px)" : "translateX(2px)" }}
                />
              </div>
            </button>
          </div>

          {/* Start / End */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-medium w-10 flex-shrink-0 text-[#9aa0a6]">시작</span>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputCls + " flex-1"} />
              {!allDay && (
                <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={inputCls + " w-[110px] flex-shrink-0"} />
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-medium w-10 flex-shrink-0 text-[#9aa0a6]">종료</span>
              <input type="date" value={endDate} min={startDate} onChange={(e) => setEndDate(e.target.value)} className={inputCls + " flex-1"} />
              {!allDay && (
                <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className={inputCls + " w-[110px] flex-shrink-0"} />
              )}
            </div>
          </div>

          {/* Description */}
          <div className="flex items-start gap-3">
            <span className="text-[11px] font-medium w-10 pt-2 flex-shrink-0 text-[#9aa0a6]">메모</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="메모 추가..."
              rows={2}
              className={inputCls + " flex-1 resize-none"}
              style={{ lineHeight: "1.5" }}
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-[12px] text-red-500 text-center px-2 py-1.5 bg-red-50 rounded-lg">{error}</p>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!title.trim() || saving}
            className="w-full py-2.5 rounded-xl text-[13px] font-semibold transition-all flex items-center justify-center gap-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white disabled:opacity-40"
          >
            {saving
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : isEdit ? "수정 완료" : "일정 추가"}
          </button>
        </div>
      </div>
    </div>
  )
}
