"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { AppShell } from "@/components/layout/AppShell"
import { CalendarGrid } from "@/components/calendar/CalendarGrid"
import { CreateEventModal } from "@/components/calendar/CreateEventModal"
import { EventDetailModal } from "@/components/calendar/EventDetailModal"
import { DayDetailPanel } from "@/components/calendar/DayDetailPanel"
import { CalendarEvent } from "@/types"
import { toLocalDateStr, eventLocalDate } from "@/lib/utils"
import { Plus, RefreshCw } from "lucide-react"

export default function CalendarPage() {
  const { data: session } = useSession({ required: true })
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [panelDate, setPanelDate] = useState<Date | null>(null)
  const [detailEvent, setDetailEvent] = useState<CalendarEvent | null>(null)
  const [editEvent, setEditEvent] = useState<CalendarEvent | null>(null)
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())

  const fetchEvents = async (year = currentYear, month = currentMonth) => {
    setLoading(true)
    const start = new Date(year, month, 1)
    const end = new Date(year, month + 1, 0, 23, 59, 59)
    try {
      const res = await fetch(
        `/api/calendar?timeMin=${start.toISOString()}&timeMax=${end.toISOString()}`
      )
      const data = await res.json()
      setEvents(data.events || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session) fetchEvents()
  }, [session])

  const handleMonthChange = (year: number, month: number) => {
    setCurrentYear(year)
    setCurrentMonth(month)
    fetchEvents(year, month)
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    setPanelDate(date)
  }

  const getPanelEvents = (date: Date): CalendarEvent[] => {
    const ds = toLocalDateStr(date)
    return events.filter((e) => {
      const start = eventLocalDate(e.start.dateTime, e.start.date)
      const end = eventLocalDate(e.end.dateTime, e.end.date)
      if (!start) return false
      if (e.start.date) {
        const endAdj = end ? toLocalDateStr(new Date(new Date(end).getTime() - 86400000)) : start
        return ds >= start && ds <= endAdj
      }
      return start === ds
    })
  }

  return (
    <AppShell>
      <div className="p-4 lg:p-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-[17px] font-semibold text-[#202124]">캘린더</h1>
            <p className="text-[12px] mt-0.5 text-[#9aa0a6]">Google Calendar</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchEvents()}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-[#dadce0] text-[#5f6368] hover:bg-[#f1f3f4] hover:text-[#202124] transition-colors"
              title="새로고침"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            </button>
            <button
              onClick={() => { setSelectedDate(undefined); setShowModal(true) }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-medium bg-[#1a73e8] text-white hover:bg-[#1557b0] transition-colors shadow-sm"
            >
              <Plus size={14} strokeWidth={2.5} />
              <span className="hidden sm:inline">새 일정</span>
            </button>
          </div>
        </div>

        <CalendarGrid
          events={events}
          onMonthChange={handleMonthChange}
          onDateClick={handleDateClick}
          onEventClick={(event) => setDetailEvent(event)}
        />
      </div>

      {panelDate && !showModal && !detailEvent && !editEvent && (
        <DayDetailPanel
          date={panelDate}
          events={getPanelEvents(panelDate)}
          onClose={() => setPanelDate(null)}
          onNewEvent={() => { setShowModal(true) }}
          onEventClick={(event) => { setDetailEvent(event) }}
        />
      )}

      {showModal && (
        <CreateEventModal
          defaultDate={selectedDate}
          onClose={() => setShowModal(false)}
          onCreated={() => { fetchEvents(); setShowModal(false) }}
        />
      )}
      {detailEvent && (
        <EventDetailModal
          event={detailEvent}
          onClose={() => setDetailEvent(null)}
          onEdit={(ev) => { setEditEvent(ev); setDetailEvent(null) }}
          onDeleted={() => { fetchEvents(); setPanelDate(null) }}
        />
      )}
      {editEvent && (
        <CreateEventModal
          editEvent={editEvent}
          onClose={() => setEditEvent(null)}
          onCreated={() => { fetchEvents(); setEditEvent(null) }}
        />
      )}
    </AppShell>
  )
}
