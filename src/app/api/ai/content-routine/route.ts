import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

const DEFAULT_ROUTINE = [
  { day: "월", tasks: ["유튜브 주제 선정", "스크립트 초안"], type: "planning" },
  { day: "화", tasks: ["스크립트 완성", "B-roll 목록 작성"], type: "planning" },
  { day: "수", tasks: ["메인 촬영", "B-roll 촬영"], type: "filming" },
  { day: "목", tasks: ["영상 편집", "자막 & 자동화"], type: "editing" },
  { day: "금", tasks: ["썸네일", "업로드 & SNS 배포"], type: "upload" },
  { day: "토", tasks: ["사업 미팅", "마케팅 기획"], type: "business" },
  { day: "일", tasks: ["다음 주 계획", "아이디어 캡처"], type: "rest" },
]

export async function GET() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id

  if (!userId) return NextResponse.json({ error: "인증 필요" }, { status: 401 })

  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === "your_anthropic_api_key_here") {
    return NextResponse.json({ routine: DEFAULT_ROUTINE })
  }

  const projects = await prisma.project.findMany({
    where: { userId, status: "active" },
    select: { title: true, category: true, progress: true },
  })

  const ideas = await prisma.idea.findMany({
    where: { userId, status: "capture" },
    select: { title: true, category: true },
    take: 5,
    orderBy: { createdAt: "desc" },
  })

  const prompt = `당신은 콘텐츠 제작자이자 사업 운영자의 AI 일정 어시스턴트입니다.

현재 진행 중인 프로젝트:
${projects.map((p) => `- [${p.category}] ${p.title} (${p.progress}% 완료)`).join("\n") || "없음"}

최근 아이디어:
${ideas.map((i) => `- ${i.title}`).join("\n") || "없음"}

이 사람의 업무 특성:
- 유튜브 콘텐츠 기획 및 제작
- 건강식품 사업 운영
- AI 자동화 프로젝트
- 혼자 집중하는 시간이 중요
- 에너지 흐름 중심 관리 선호

위 내용을 바탕으로 최적의 주간 루틴을 JSON으로만 응답하세요 (마크다운 없이):
[
  { "day": "월", "tasks": ["구체적인 작업1", "구체적인 작업2"], "type": "planning" },
  { "day": "화", "tasks": ["작업"], "type": "filming" },
  { "day": "수", "tasks": ["작업1", "작업2"], "type": "editing" },
  { "day": "목", "tasks": ["작업"], "type": "business" },
  { "day": "금", "tasks": ["작업1", "작업2"], "type": "upload" },
  { "day": "토", "tasks": ["작업"], "type": "business" },
  { "day": "일", "tasks": ["작업"], "type": "rest" }
]

type은 반드시: planning, filming, editing, upload, business, rest 중 하나.
각 작업은 구체적이고 실행 가능하게.`

  try {
    const { default: Anthropic } = await import("@anthropic-ai/sdk")
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    })
    const text = message.content[0].type === "text" ? message.content[0].text.trim() : "[]"
    const routine = JSON.parse(text)
    return NextResponse.json({ routine })
  } catch {
    return NextResponse.json({ routine: DEFAULT_ROUTINE })
  }
}
