export interface CalendarEvent {
  id: string
  summary: string
  description?: string | null
  start: { dateTime?: string; date?: string; timeZone?: string }
  end: { dateTime?: string; date?: string; timeZone?: string }
  colorId?: string
  location?: string
  status?: string
}

export type IdeaCategory = "youtube" | "business" | "ai" | "marketing" | "general"
export type IdeaStatus = "capture" | "scheduled" | "later" | "done"
export type ProjectCategory = "content" | "business" | "ai" | "marketing"
export type ProjectStatus = "active" | "paused" | "completed"

export interface Idea {
  id: string
  title: string
  content?: string | null
  category: IdeaCategory
  status: IdeaStatus
  userId: string
  eventId?: string | null
  createdAt: Date | string
  updatedAt: Date | string
}

export interface Project {
  id: string
  title: string
  description?: string | null
  category: ProjectCategory
  status: ProjectStatus
  progress: number
  color: string
  userId: string
  createdAt: Date | string
  updatedAt: Date | string
}

export const CATEGORY_LABELS: Record<string, string> = {
  youtube: "유튜브",
  content: "콘텐츠",
  business: "사업",
  ai: "AI 자동화",
  marketing: "마케팅",
  general: "일반",
  idea: "아이디어",
}

export const CATEGORY_COLORS: Record<string, string> = {
  youtube: "#10b981",
  content: "#10b981",
  business: "#f59e0b",
  ai: "#06b6d4",
  marketing: "#a855f7",
  general: "#6b7280",
  idea: "#f97316",
}

export const STATUS_LABELS: Record<string, string> = {
  capture: "캡처됨",
  scheduled: "일정등록",
  later: "나중에",
  done: "완료",
  active: "진행중",
  paused: "일시중단",
  completed: "완료",
}
