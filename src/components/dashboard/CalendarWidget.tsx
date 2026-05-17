"use client"

import { useEffect, useState } from "react"
import { Calendar, ChevronRight } from "lucide-react"
import { CalendarEvent } from "@/types"
import { formatTime, toLocalDateStr, eventLocalDate } from "@/lib/utils"
import Link from "next/link"

const GOOGLE_COLOR_MAP: Record<string, string> = {
  "10": "#10b981",
  "6": "#f59e0b",
  "7": "#06b6d4",
  "3": "#a855f7",
  "9": "#1a73e8",
  "11": "#ef4444",
  "5": "#eab308",
}

export function CalendarWidget() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const today = new Date()
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7, 23, 59)

    fetch(
      `/api/calendar?timeMin=${start.toISOString()}&timeMax=${end.toISOString()}`
    )
      .then((r) => r.json())
      .then((d) => setEvents(d.events || []))
      .finally(() => setLoading(false))
  }, [])

  const today = new Date()
  const todayStr = toLocalDateStr(today)

  const todayEvents = events.filter((e) => {
    return eventLocalDate(e.start.dateTime, e.start.date) === todayStr
  })

  const upcomingEvents = events.filter((e) => {
    const d = eventLocalDate(e.start.dateTime, e.start.date)
    return d && d > todayStr
  }).slice(0, 4)

  return (
    <div className="card animate-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-[#1a73e8]" />
          <h2 className="text-[14px] font-semibold text-[#202124]">이번 주 일정</h2>
        </div>
        <Link
          href="/calendar"
          className="text-[12px] text-[#1a73e8] hover:text-[#1557b0] transition-colors flex items-center gap-1 font-medium"
        >
          전체 보기 <ChevronRight size={11} />
        </Link>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-[#f1f3f4] rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-1">
          {/* 오늘 */}
          <p className="text-[11px] text-[#9aa0a6] font-medium mb-2 uppercase tracking-wider">
            오늘 ({todayEvents.length}개)
          </p>
          {todayEvents.length === 0 ? (
            <p className="text-[13px] text-[#9aa0a6] py-2">오늘 일정 없음</p>
          ) : (
            todayEvents.map((event) => {
              const color = GOOGLE_COLOR_MAP[event.colorId || ""] || "#1a73e8"
              return (
                <div
                  key={event.id}
                  className="flex items-center gap-2.5 py-2 px-3 bg-[#f8f9fa] rounded-lg border border-[#e8eaed]"
                >
                  <span
                    className="w-1.5 h-5 rounded-sm flex-shrink-0"
                    style={{ background: color }}
                  />
                  <span className="text-[12px] text-[#5f6368] font-medium">
                    {formatTime(event.start.dateTime) || "종일"}
                  </span>
                  <span className="text-[13px] text-[#202124] truncate">
                    {event.summary}
                  </span>
                </div>
              )
            })
          )}

          {/* 이후 일정 */}
          {upcomingEvents.length > 0 && (
            <>
              <p className="text-[11px] text-[#9aa0a6] font-medium mt-4 mb-2 uppercase tracking-wider">
                이후 일정
              </p>
              {upcomingEvents.map((event) => {
                const color = GOOGLE_COLOR_MAP[event.colorId || ""] || "#1a73e8"
                const date = new Date(
                  event.start.dateTime || event.start.date || ""
                )
                return (
                  <div
                    key={event.id}
                    className="flex items-center gap-2.5 py-2 px-3 rounded-lg hover:bg-[#f1f3f4] transition-colors"
                  >
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: color }}
                    />
                    <span className="text-[12px] text-[#5f6368]">
                      {date.toLocaleDateString("ko-KR", {
                        month: "numeric",
                        day: "numeric",
                        weekday: "short",
                      })}
                    </span>
                    <span className="text-[13px] text-[#202124] truncate">
                      {event.summary}
                    </span>
                  </div>
                )
              })}
            </>
          )}
        </div>
      )}
    </div>
  )
}
