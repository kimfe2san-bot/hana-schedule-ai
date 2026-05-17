"use client"

import { useState } from "react"
import { X, Trash2, Pencil, Clock, Calendar } from "lucide-react"
import { CalendarEvent } from "@/types"
import { formatTime, toLocalDateStr } from "@/lib/utils"

const PALETTE: Record<string, string> = {
  "1": "#7986cb", "2": "#33b679", "3": "#8e24aa", "4": "#e67c73",
  "5": "#f6bf26", "6": "#f4511e", "7": "#039be5", "8": "#616161",
  "9": "#3f51b5", "10": "#0b8043", "11": "#d50000",
}

interface Props {
  event: CalendarEvent
  onClose: () => void
  onEdit: (event: CalendarEvent) => void
  onDeleted: () => void
}

export function EventDetailModal({ event, onClose, onEdit, onDeleted }: Props) {
  const [deleting, setDeleting] = useState(false)

  const color = PALETTE[event.colorId || ""] || "#1a73e8"
  const isAllDay = !!event.start.date
  const startDateStr = isAllDay
    ? event.start.date
    : toLocalDateStr(new Date(event.start.dateTime!))
  const endDateStr = (() => {
    if (isAllDay && event.end.date) {
      // Google all-day end is exclusive — show day before
      const d = new Date(event.end.date)
      d.setDate(d.getDate() - 1)
      return toLocalDateStr(d)
    }
    if (event.end.dateTime) return toLocalDateStr(new Date(event.end.dateTime))
    return startDateStr
  })()
  const isMultiDay = startDateStr !== endDateStr
  const startTime = formatTime(event.start.dateTime)
  const endTime = formatTime(event.end.dateTime)

  const handleDelete = async () => {
    if (!confirm(`"${event.summary}" 일정을 삭제할까요?`)) return
    setDeleting(true)
    try {
      await fetch(`/api/calendar?eventId=${event.id}`, { method: "DELETE" })
      onDeleted()
      onClose()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-sm rounded-2xl bg-white border border-[#dadce0] shadow-xl animate-in overflow-hidden">
        {/* 상단 색상 바 + 닫기 */}
        <div className="h-1.5 w-full" style={{ background: color }} />
        <div className="flex items-start justify-between px-5 pt-4 pb-2">
          <h2 className="text-[16px] font-semibold text-[#202124] flex-1 pr-4">
            {event.summary}
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full text-[#9aa0a6] hover:bg-[#f1f3f4] transition-colors flex-shrink-0"
          >
            <X size={15} />
          </button>
        </div>

        <div className="px-5 pb-5 space-y-3">
          {/* 날짜/시간 */}
          <div className="flex items-center gap-2.5 text-[13px] text-[#5f6368]">
            <Calendar size={15} className="flex-shrink-0 text-[#9aa0a6]" />
            {isMultiDay
              ? <span>{startDateStr} — {endDateStr}</span>
              : <span>{startDateStr}</span>
            }
          </div>
          {!isAllDay && (startTime || endTime) && (
            <div className="flex items-center gap-2.5 text-[13px] text-[#5f6368]">
              <Clock size={15} className="flex-shrink-0 text-[#9aa0a6]" />
              <span>{startTime} — {endTime}</span>
            </div>
          )}
          {event.description && (
            <p className="text-[13px] text-[#5f6368] pl-[27px]">{event.description}</p>
          )}

          {/* 버튼 */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => { onEdit(event); onClose() }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-[#dadce0] text-[13px] font-medium text-[#5f6368] hover:bg-[#f1f3f4] transition-colors"
            >
              <Pencil size={13} /> 수정
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-red-100 text-[13px] font-medium text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              <Trash2 size={13} /> {deleting ? "삭제 중..." : "삭제"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
