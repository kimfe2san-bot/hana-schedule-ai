import Anthropic from "@anthropic-ai/sdk"

const FALLBACK_RECOMMENDATIONS = {
  focus: [
    "오늘의 핵심 콘텐츠 작업 완료하기",
    "사업 관련 미결 사항 처리",
    "아이디어 정리 및 다음 주 계획",
  ],
  blocks: [
    "오전 9-11시: 집중 창작 블록",
    "오후 2-4시: 사업 처리 블록",
    "오후 5-6시: 아이디어 캡처 & 정리",
  ],
  tip: "에너지가 가장 높은 오전 시간에 창의적인 작업을 배치하세요.",
}

function getClient(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
}

export async function getAIRecommendations(
  events: { summary: string; start: string }[],
  projects: { title: string; category: string; progress: number }[],
  ideas: { title: string; category: string }[]
): Promise<{ focus: string[]; blocks: string[]; tip: string }> {
  const client = getClient()
  if (!client) return FALLBACK_RECOMMENDATIONS

  const today = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  })

  const prompt = `당신은 콘텐츠 제작자이자 사업 운영자의 AI 일정 어시스턴트입니다.

오늘 날짜: ${today}

오늘 일정:
${events.map((e) => `- ${e.start}: ${e.summary}`).join("\n") || "일정 없음"}

진행 중인 프로젝트:
${projects.map((p) => `- [${p.category}] ${p.title} (${p.progress}% 완료)`).join("\n") || "없음"}

최근 아이디어:
${ideas.map((i) => `- [${i.category}] ${i.title}`).join("\n") || "없음"}

위 내용을 바탕으로 다음 JSON 형식으로만 응답하세요 (마크다운 없이):
{
  "focus": ["핵심 업무 1", "핵심 업무 2", "핵심 업무 3"],
  "blocks": ["추천 집중 블록 1 (예: 오전 9-11시 유튜브 스크립트 작성)", "추천 블록 2", "추천 블록 3"],
  "tip": "오늘의 에너지 관리 팁 (1-2문장)"
}`

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 512,
      messages: [{ role: "user", content: prompt }],
    })
    const text = message.content[0].type === "text" ? message.content[0].text : ""
    const parsed = JSON.parse(text.trim())
    return {
      focus: parsed.focus || FALLBACK_RECOMMENDATIONS.focus,
      blocks: parsed.blocks || FALLBACK_RECOMMENDATIONS.blocks,
      tip: parsed.tip || FALLBACK_RECOMMENDATIONS.tip,
    }
  } catch {
    return FALLBACK_RECOMMENDATIONS
  }
}
