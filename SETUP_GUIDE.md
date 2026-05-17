# My Calendar — 설치 및 실행 가이드

## 전체 구조

```
my-calendar/
├── src/
│   ├── app/
│   │   ├── page.tsx              ← 대시보드 (메인)
│   │   ├── calendar/page.tsx     ← 캘린더 뷰
│   │   ├── ideas/page.tsx        ← 아이디어 관리
│   │   ├── projects/page.tsx     ← 프로젝트 관리
│   │   └── api/                  ← 백엔드 API
│   ├── components/               ← UI 컴포넌트
│   └── lib/                      ← 유틸리티
├── prisma/schema.prisma          ← 데이터베이스 스키마
├── .env.local                    ← 환경 변수 (직접 입력 필요)
└── setup.bat                     ← 자동 설치 스크립트
```

---

## STEP 1. Node.js 설치 확인

터미널(PowerShell)에서:
```
node --version
```
버전이 뜨면 OK. 없으면 https://nodejs.org 에서 LTS 버전 설치.

---

## STEP 2. Google Cloud Console 설정 (Google Calendar 연동)

1. https://console.cloud.google.com 접속
2. 새 프로젝트 만들기 (이름: "My Calendar")
3. 왼쪽 메뉴 → **API 및 서비스** → **사용 설정된 API**
4. **Google Calendar API** 검색 후 사용 설정
5. 왼쪽 메뉴 → **사용자 인증 정보** → **사용자 인증 정보 만들기** → **OAuth 클라이언트 ID**
6. 애플리케이션 유형: **웹 애플리케이션**
7. 승인된 리디렉션 URI 추가:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
8. 만들기 → **클라이언트 ID**와 **클라이언트 보안 비밀** 복사

---

## STEP 3. .env.local 파일 설정

`my-calendar/.env.local` 파일을 열어 아래 내용 입력:

```env
GOOGLE_CLIENT_ID=여기에_클라이언트_ID_붙여넣기
GOOGLE_CLIENT_SECRET=여기에_클라이언트_시크릿_붙여넣기

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=아무글자나입력해도됩니다12345

ANTHROPIC_API_KEY=여기에_앤트로픽_API_키_입력

DATABASE_URL="file:./dev.db"
```

**Anthropic API 키 발급:** https://console.anthropic.com → API Keys → Create Key

---

## STEP 4. 설치 및 실행

```powershell
# my-calendar 폴더에서 실행
cd C:\Users\User\my-calendar

# 자동 설치 (패키지 + DB 초기화)
.\setup.bat

# 개발 서버 실행
npm run dev
```

브라우저에서 http://localhost:3000 접속

---

## 주요 기능 사용법

### 대시보드
- **AI 오늘의 핵심**: Claude가 일정/프로젝트 분석 후 오늘 할 일 3가지 추천
- **이번 주 일정**: Google Calendar와 실시간 연동
- **아이디어 캡처**: 떠오른 아이디어를 바로 입력 (Enter키로 저장)
- **진행 중 프로젝트**: 진행률 클릭으로 빠른 업데이트

### 캘린더 (`/calendar`)
- Google Calendar 월별 보기
- 날짜 클릭 → 새 일정 추가 모달
- 카테고리별 색상 자동 적용

### 아이디어 (`/ideas`)
- 상태별 필터: 캡처됨 → 일정등록 → 나중에 → 완료
- 카테고리별 필터: 유튜브, 사업, AI, 마케팅

### 프로젝트 (`/projects`)
- 새 프로젝트 생성 (카테고리 선택)
- 진행률 버튼으로 업데이트 (0/25/50/75/100%)
- 100% 달성 시 완료 처리 버튼

---

## 향후 확장 방법

| 기능 | 방법 |
|------|------|
| 반복 루틴 자동 생성 | `/api/calendar` PATCH + Google Calendar recurrence 필드 |
| 콘텐츠 촬영/편집/업로드 분리 | `prisma/schema.prisma`에 ContentPlan 모델 추가 |
| 피로도 기반 일정 제안 | Claude API 프롬프트에 시간대별 에너지 정보 추가 |
| 모바일 앱 | React Native + 같은 API 재사용 |
| 알림 기능 | Next.js API Route + cron + 이메일/슬랙 연동 |
| 통계 대시보드 | Recharts 라이브러리로 생산성 그래프 추가 |

---

## 문제 해결

**"prisma db push 실패"**
→ `.env.local`에 `DATABASE_URL="file:./dev.db"` 있는지 확인

**"Google 로그인 오류"**
→ Cloud Console 리디렉션 URI에 `http://localhost:3000/api/auth/callback/google` 추가 확인

**"AI 추천이 안 나옴"**
→ `ANTHROPIC_API_KEY` 올바른지 확인. 잘못되어도 기본값으로 표시됨.
