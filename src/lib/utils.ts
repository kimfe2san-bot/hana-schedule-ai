import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  })
}

export function formatTime(dateTime: string | undefined): string {
  if (!dateTime) return ""
  const d = new Date(dateTime)
  return d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })
}

export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 6) return "좋은 새벽이에요"
  if (hour < 12) return "좋은 아침이에요"
  if (hour < 17) return "좋은 오후예요"
  if (hour < 21) return "좋은 저녁이에요"
  return "좋은 밤이에요"
}

export function getDayOfWeek(date: Date = new Date()): string {
  const days = ["일", "월", "화", "수", "목", "금", "토"]
  return days[date.getDay()]
}

export function isToday(dateStr: string): boolean {
  const today = new Date()
  const d = new Date(dateStr)
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  )
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

export function isoString(date: Date): string {
  return date.toISOString()
}

export function toLocalDateStr(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

export function eventLocalDate(dateTime?: string, date?: string): string {
  if (dateTime) return toLocalDateStr(new Date(dateTime))
  return date || ""
}
