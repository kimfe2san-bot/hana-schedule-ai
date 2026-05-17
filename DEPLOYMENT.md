# 클라우드 배포 완전 가이드

## 전체 흐름

```
로컬 개발 → GitHub 업로드 → Vercel 배포 → Supabase DB 연결
```

---

## STEP 1. Supabase 클라우드 DB 설정

### 1-1. 프로젝트 생성
1. https://supabase.com 접속 → 회원가입 (무료)
2. **New Project** 클릭
3. 이름: `my-calendar`, 비밀번호 기억해두기, 리전: **Northeast Asia (Seoul)**
4. 생성 완료까지 약 2분 대기

### 1-2. 연결 URL 복사
1. Supabase 대시보드 → **Settings** → **Database**
2. **Connection string** 섹션 → **Transaction** 탭 선택
3. URI 복사 → `[YOUR-PASSWORD]` 부분에 아까 설정한 비밀번호 입력

```
DATABASE_URL (Transaction - 6543 포트):
postgresql://postgres.[ref]:[pw]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1

DIRECT_URL (Session - 5432 포트):
postgresql://postgres.[ref]:[pw]@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres
```

---

## STEP 2. Google Cloud Console 업데이트

Vercel 배포 후 URL이 바뀌므로, 리디렉션 URI를 추가해야 합니다.

1. https://console.cloud.google.com → 기존 OAuth 클라이언트 수정
2. **승인된 리디렉션 URI** 추가:
   ```
   https://your-app-name.vercel.app/api/auth/callback/google
   ```
3. 저장

---

## STEP 3. GitHub에 코드 올리기

```powershell
# my-calendar 폴더에서 실행
cd C:\Users\User\my-calendar

# Git 초기화
git init
git add .
git commit -m "Initial commit: My Calendar cloud version"

# GitHub에서 새 repository 생성 후:
git remote add origin https://github.com/YOUR_USERNAME/my-calendar.git
git branch -M main
git push -u origin main
```

---

## STEP 4. Vercel 배포

### 4-1. Vercel 계정 설정
1. https://vercel.com → GitHub 계정으로 로그인
2. **Add New Project** → GitHub repository 선택
3. **Framework Preset**: Next.js (자동 감지)

### 4-2. 환경변수 설정 (중요!)
**Settings → Environment Variables** 에서 아래 추가:

| Key | Value |
|-----|-------|
| `GOOGLE_CLIENT_ID` | Google Cloud에서 복사한 ID |
| `GOOGLE_CLIENT_SECRET` | Google Cloud에서 복사한 시크릿 |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` |
| `NEXTAUTH_SECRET` | 랜덤 문자열 (아래 방법으로 생성) |
| `DATABASE_URL` | Supabase Transaction URL (6543 포트) |
| `DIRECT_URL` | Supabase Direct URL (5432 포트) |
| `ANTHROPIC_API_KEY` | Anthropic API 키 |

**NEXTAUTH_SECRET 생성 방법:**
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4-3. 빌드 명령어 확인
- Build Command: `prisma generate && next build` (vercel.json에 이미 설정됨)

### 4-4. 배포 실행
**Deploy** 클릭 → 약 3-5분 대기

배포 완료 후 URL: `https://your-app-name.vercel.app`

---

## STEP 5. Supabase에 테이블 생성

Vercel 배포 성공 후, 로컬에서 한 번만 실행:

```powershell
# .env.local에 Supabase URL 설정 후
npx prisma db push
```

또는 Vercel 대시보드 → **Functions** 탭에서 직접 실행 가능.

---

## STEP 6. PWA 아이콘 추가 (홈화면 추가용)

`public/` 폴더에 아래 두 파일 추가:
- `icon-192.png` (192×192 픽셀)
- `icon-512.png` (512×512 픽셀)

**무료 아이콘 생성 도구:**
- https://favicon.io → Text to Favicon으로 생성

---

## 모바일에서 앱으로 설치하기

### iOS (아이폰/아이패드)
1. Safari에서 배포 URL 접속
2. 하단 공유 버튼 탭
3. **홈 화면에 추가** 선택

### Android
1. Chrome에서 배포 URL 접속
2. 주소창 오른쪽 메뉴 (⋮) 탭
3. **홈 화면에 추가** 또는 **앱 설치** 선택

---

## 업데이트 배포 방법

코드 수정 후:
```powershell
git add .
git commit -m "기능 업데이트"
git push
```
→ Vercel이 자동으로 재배포 (약 2-3분)

---

## 비용 안내

| 서비스 | 무료 범위 |
|--------|-----------|
| **Vercel** | 무료 (취미/개인 프로젝트) |
| **Supabase** | 500MB DB, 2GB 전송/월 무료 |
| **Google Calendar API** | 무료 |
| **Anthropic API** | 유료 (사용량 기반, 월 $5-10 예상) |

---

## 문제 해결

**빌드 실패: prisma generate 오류**
→ `DATABASE_URL`과 `DIRECT_URL` 환경변수 확인

**로그인 오류 (OAuth redirect)**
→ `NEXTAUTH_URL`이 Vercel 실제 URL과 일치하는지 확인
→ Google Cloud Console 리디렉션 URI 추가 확인

**DB 연결 오류**
→ Supabase 프로젝트가 일시정지 상태인지 확인 (무료 플랜은 7일 미접속 시 일시정지)
→ Supabase 대시보드 → **Restore project** 클릭

**AI 추천이 안 나옴**
→ `ANTHROPIC_API_KEY` 확인. 없어도 기본값으로 동작함.

---

## 향후 확장 방법

| 기능 | 방법 |
|------|------|
| 팀 공유 (SaaS) | `prisma/schema.prisma`에 `Team` 모델 추가 |
| 알림 (이메일) | Resend 또는 Nodemailer 연동 |
| 알림 (푸시) | Web Push API + VAPID 키 설정 |
| 결제 (SaaS 전환) | Stripe 연동 |
| 분석 대시보드 | Recharts + 주간 데이터 집계 API 추가 |
| Notion 연동 | Notion API로 아이디어 양방향 동기화 |
