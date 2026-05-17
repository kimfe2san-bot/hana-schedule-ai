import { google } from "googleapis"

export function getCalendarClient(accessToken: string) {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  )
  auth.setCredentials({ access_token: accessToken })
  return google.calendar({ version: "v3", auth })
}

export async function getEvents(
  accessToken: string,
  timeMin: string,
  timeMax: string
) {
  const calendar = getCalendarClient(accessToken)
  const res = await calendar.events.list({
    calendarId: "primary",
    timeMin,
    timeMax,
    singleEvents: true,
    orderBy: "startTime",
    maxResults: 100,
  })
  return res.data.items || []
}

export async function createEvent(
  accessToken: string,
  event: {
    summary: string
    description?: string
    start: { dateTime?: string; date?: string; timeZone?: string }
    end: { dateTime?: string; date?: string; timeZone?: string }
    colorId?: string
  }
) {
  const calendar = getCalendarClient(accessToken)
  const res = await calendar.events.insert({
    calendarId: "primary",
    requestBody: event,
  })
  return res.data
}

export async function updateEvent(
  accessToken: string,
  eventId: string,
  event: Partial<{
    summary: string
    description: string
    start: { dateTime?: string; date?: string; timeZone?: string }
    end: { dateTime?: string; date?: string; timeZone?: string }
    colorId: string
  }>
) {
  const calendar = getCalendarClient(accessToken)
  const res = await calendar.events.patch({
    calendarId: "primary",
    eventId,
    requestBody: event,
  })
  return res.data
}

export async function deleteEvent(accessToken: string, eventId: string) {
  const calendar = getCalendarClient(accessToken)
  await calendar.events.delete({ calendarId: "primary", eventId })
}

// 구글 캘린더 색상 ID 매핑
export const GOOGLE_COLORS: Record<string, string> = {
  "1": "#a4bdfc", // 라벤더
  "2": "#7ae28c", // 세이지
  "3": "#dbadff", // 포도
  "4": "#ff887c", // 플라밍고
  "5": "#fbd75b", // 바나나
  "6": "#ffb878", // 탠저린
  "7": "#46d6db", // 피콕
  "8": "#e1e1e1", // 그레파이트
  "9": "#5484ed", // 블루베리
  "10": "#51b749", // 세이지
  "11": "#dc2127", // 토마토
}

// 카테고리별 구글 색상 ID
export const CATEGORY_COLOR_IDS: Record<string, string> = {
  content: "10", // 세이지 (초록)
  youtube: "10",
  business: "6", // 탠저린 (주황)
  ai: "7", // 피콕 (청록)
  marketing: "3", // 포도 (보라)
  general: "8", // 그레파이트 (회색)
}
