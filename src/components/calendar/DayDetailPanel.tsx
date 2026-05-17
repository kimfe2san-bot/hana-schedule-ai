"use client"

import { CalendarEvent } from "@/types"
import { formatTime } from "@/lib/utils"
import { X, Plus, Clock, Calendar } from "lucide-react"

const PALETTE: Record<string, { bg: string; text: string }> = {
  "1":  { bg: "#7986cb", text: "#ffffff" },
  "2":  { bg: "#33b679", text: "#ffffff" },
  "3":  { bg: "#8e24aa", text: "#ffffff" },
  "4":  { bg: "#e67c73", text: "#ffffff" },
  "5":  { bg: "#f6bf26", text: "#202124" },
  "6":  { bg: "#f4511e", text: "#ffffff" },
  "7":  { bg: "#039be5", text: "#ffffff" },
  "8":  { bg: "#616161", text: "#ffffff" },
  "9":  { bg: "#3f51b5", text: "#ffffff" },
  "10": { bg: "#0b8043", text: "#ffffff" },
  "11": { bg: "#d50000", text: "#ffffff" },
}
const DEFAULT_PALETTE = { bg: "#1a73e8", text: "#ffffff" }

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"]

interface Props {
  date: Date
  events: CalendarEvent[]
  onClose: () => void
  onNewEvent: () => void
  onEventClick: (event: CalendarEvent) => void
}

function sortEvents(events: CalendarEvent[]): CalendarEvent[] {
  return [...events].sort((a, b) => {
    const aTime = a.start.dateTime ?? a.start.date ?? ""
    const bTime = b.start.dateTime ?? b.start.date ?? ""
    if (!a.start.dateTime && b.start.dateTime) return -1
    if (a.start.dateTime && !b.start.dateTime) return 1
    return aTime.localeCompare(bTime)
  })
}

export function DayDetailPanel({ date, events, onClose, onNewEvent, onEventClick }: Props) {
  const month = date.getMonth() + 1
  const day = date.getDate()
  const weekday = WEEKDAYS[date.getDay()]
  const isSun = date.getDay() === 0
  const isSat = date.getDay() === 6

  const sorted = sortEvents(events)
  const allDay = sorted.filter((e) => !!e.start.date)
  const timed = sorted.filter((e) => !!e.start.dateTime)

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#dadce0] shadow-2xl"
        style={{ maxHeight: "60vh", borderRadius: "20px 20px 0 0" }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-[#dadce0]" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#e8eaed]">
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center leading-none">
              <span className="text-[11px] font-medium" style={{ color: isSun ? "#d93025" : isSat ? "#1a73e8" : "#5f6368" }}>
                {weekday}
              </span>
              <span className="text-[28px] font-light text-[#202124] tabular-nums leading-tight">
                {day}
              </span>
            </div>
            <div>
              <span className="text-[13px] text-[#5f6368]">{month}월</span>
              {events.length > 0 && (
                <p className="text-[11px] text-[#9aa0a6]">일정 {events.length}개</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onNewEvent}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium bg-[#1a73e8] text-white hover:bg-[#1557b0] transition-colors"
            >
              <Plus size={13} strokeWidth={2.5} />
              새 일정
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-full text-[#9aa0a6] hover:bg-[#f1f3f4] transition-colors"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Event list */}
        <div className="overflow-y-auto px-4 py-3 space-y-1" style={{ maxHeight: "calc(60vh - 110px)" }}>
          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Calendar size={32} className="text-[#dadce0] mb-2" />
              <p className="text-[13px] text-[#9aa0a6]">일정이 없습니다</p>
              <button
                onClick={onNewEvent}
                className="mt-3 text-[12px] text-[#1a73e8] font-medium hover:underline"
              >
                일정 추가하기
              </button>
            </div>
          ) : (
            <>
              {allDay.map((event) => {
                const c = PALETTE[event.colorId || ""] || DEFAULT_PALETTE
                return (
                  <button
                    key={event.id}
                    onClick={() => onEventClick(event)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#f8f9fa] transition-colors text-left"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: c.bg }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-[#202124] truncate">{event.summary}</p>
                      <p className="text-[11px] text-[#9aa0a6]">종일</p>
                      {event.description && (
                        <p className="text-[11px] text-[#9aa0a6] mt-0.5 line-clamp-2">{event.description}</p>
                      )}
                    </div>
                  </button>
                )
              })}
              {timed.map((event) => {
                const c = PALETTE[event.colorId || ""] || DEFAULT_PALETTE
                const start = formatTime(event.start.dateTime)
                const end = formatTime(event.end.dateTime)
                return (
                  <button
                    key={event.id}
                    onClick={() => onEventClick(event)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#f8f9fa] transition-colors text-left"
                  >
                    <div
                      className="w-2.5 flex-shrink-0 self-stretch rounded-full"
                      style={{ backgroundColor: c.bg, minHeight: "36px" }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-[#202124] truncate">{event.summary}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Clock size={10} className="text-[#9aa0a6] flex-shrink-0" />
                        <span className="text-[11px] text-[#9aa0a6]">{start} — {end}</span>
                      </div>
                      {event.description && (
                        <p className="text-[11px] text-[#9aa0a6] mt-0.5 line-clamp-2">{event.description}</p>
                      )}
                    </div>
                  </button>
                )
              })}
            </>
          )}
        </div>
      </div>
    </>
  )
}
