"use client"

import { useState } from "react"
import { CalendarEvent } from "@/types"
import { formatTime, toLocalDateStr, eventLocalDate } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"

const DAYS = ["일", "월", "화", "수", "목", "금", "토"]
const MONTHS = ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"]

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

interface Props {
  events: CalendarEvent[]
  onMonthChange: (year: number, month: number) => void
  onEventClick?: (event: CalendarEvent) => void
  onDateClick?: (date: Date) => void
}

export function CalendarGrid({ events, onMonthChange, onEventClick, onDateClick }: Props) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const today = new Date()

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const prevDays = new Date(year, month, 0).getDate()

  const cells: { date: Date; isCurrentMonth: boolean }[] = []
  for (let i = firstDay - 1; i >= 0; i--)
    cells.push({ date: new Date(year, month - 1, prevDays - i), isCurrentMonth: false })
  for (let d = 1; d <= daysInMonth; d++)
    cells.push({ date: new Date(year, month, d), isCurrentMonth: true })
  while (cells.length % 7 !== 0)
    cells.push({ date: new Date(year, month + 1, cells.length - daysInMonth - firstDay + 1), isCurrentMonth: false })

  const getEventsForDate = (date: Date) => {
    const ds = toLocalDateStr(date)
    return events.filter((e) => {
      const start = eventLocalDate(e.start.dateTime, e.start.date)
      const end = eventLocalDate(e.end.dateTime, e.end.date)
      if (!start) return false
      if (e.start.date) {
        // All-day: end is exclusive in Google Calendar
        const endAdj = end ? toLocalDateStr(new Date(new Date(end).getTime() - 86400000)) : start
        return ds >= start && ds <= endAdj
      }
      // Timed: show on start day and any additional days it spans
      const endDay = end || start
      return ds >= start && ds <= endDay
    })
  }

  const navigate = (dir: number) => {
    const next = new Date(year, month + dir, 1)
    setCurrentDate(next)
    onMonthChange(next.getFullYear(), next.getMonth())
  }

  const goToday = () => {
    const now = new Date()
    setCurrentDate(now)
    onMonthChange(now.getFullYear(), now.getMonth())
  }

  const isViewingCurrentMonth =
    year === today.getFullYear() && month === today.getMonth()

  return (
    <div className="rounded-xl border border-[#dadce0] overflow-hidden bg-white shadow-sm">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#dadce0] bg-white">
        <div className="flex items-center gap-3">
          <span className="text-[16px] font-semibold text-[#202124]">
            {year}년 {MONTHS[month]}
          </span>
          {!isViewingCurrentMonth && (
            <button
              onClick={goToday}
              className="text-[12px] font-medium px-3 py-1 rounded-full border border-[#dadce0] text-[#5f6368] hover:bg-[#f1f3f4] hover:text-[#202124] transition-colors"
            >
              오늘
            </button>
          )}
        </div>
        <div className="flex items-center gap-1">
          {[-1, 1].map((dir) => (
            <button
              key={dir}
              onClick={() => navigate(dir)}
              className="w-8 h-8 flex items-center justify-center rounded-full text-[#5f6368] hover:bg-[#f1f3f4] hover:text-[#202124] transition-colors"
            >
              {dir === -1 ? <ChevronLeft size={16} strokeWidth={2} /> : <ChevronRight size={16} strokeWidth={2} />}
            </button>
          ))}
        </div>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 border-b border-[#dadce0] bg-white">
        {DAYS.map((d, i) => (
          <div
            key={d}
            className="text-center text-[11px] font-semibold py-2 tracking-wider uppercase"
            style={{ color: i === 0 ? "#d93025" : "#70757a" }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Date Grid */}
      <div className="grid grid-cols-7">
        {cells.map(({ date, isCurrentMonth }, idx) => {
          const dayEvents = getEventsForDate(date)
          const isToday =
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
          const isSun = idx % 7 === 0
          const notLastRow = idx < cells.length - 7
          const notLastCol = idx % 7 !== 6

          return (
            <div
              key={idx}
              onClick={() => onDateClick?.(date)}
              className="relative cursor-pointer hover:bg-[#f8f9fa] transition-colors group"
              style={{
                minHeight: "80px",
                padding: "8px 6px 6px",
                background: "white",
                borderBottom: notLastRow ? "1px solid #dadce0" : "none",
                borderRight: notLastCol ? "1px solid #dadce0" : "none",
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#f8f9fa"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "white"}
            >
              {/* Date number */}
              <div className="flex justify-end mb-1">
                {isToday ? (
                  <span
                    className="w-[24px] h-[24px] flex items-center justify-center rounded-full text-[12px] font-bold tabular-nums bg-[#1a73e8] text-white"
                  >
                    {date.getDate()}
                  </span>
                ) : (
                  <span
                    className="text-[12px] font-medium tabular-nums w-[24px] h-[24px] flex items-center justify-center rounded-full hover:bg-[#f1f3f4] transition-colors"
                    style={{
                      color: !isCurrentMonth ? "#bdc1c6"
                        : isSun ? "#d93025"
                        : "#202124",
                    }}
                  >
                    {date.getDate()}
                  </span>
                )}
              </div>

              {/* Mobile: event dots */}
              {dayEvents.length > 0 && (
                <div className="flex gap-0.5 flex-wrap lg:hidden">
                  {dayEvents.slice(0, 5).map((e) => {
                    const c = PALETTE[e.colorId || ""] || DEFAULT_PALETTE
                    return (
                      <span
                        key={e.id}
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: c.bg }}
                      />
                    )
                  })}
                </div>
              )}

              {/* Desktop: event pills (max 2 + overflow indicator) */}
              <div className="hidden lg:flex flex-col gap-[2px]">
                {dayEvents.slice(0, 2).map((event) => {
                  const c = PALETTE[event.colorId || ""] || DEFAULT_PALETTE
                  const isAllDay = !!event.start.date
                  return (
                    <div
                      key={event.id}
                      onClick={(e) => { e.stopPropagation(); onEventClick?.(event) }}
                      className="flex items-center gap-1 px-1.5 py-[3px] rounded cursor-pointer hover:opacity-90 transition-opacity"
                      style={{ background: c.bg }}
                      title={event.summary}
                    >
                      {!isAllDay && (
                        <span className="text-[10px] flex-shrink-0 tabular-nums opacity-90" style={{ color: c.text }}>
                          {formatTime(event.start.dateTime)}
                        </span>
                      )}
                      <span className="text-[11px] font-medium truncate leading-tight" style={{ color: c.text }}>
                        {event.summary}
                      </span>
                    </div>
                  )
                })}
                {dayEvents.length > 2 && (
                  <div className="text-[10px] text-[#5f6368] px-1.5 py-[1px] font-medium">
                    +{dayEvents.length - 2}개 더
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
