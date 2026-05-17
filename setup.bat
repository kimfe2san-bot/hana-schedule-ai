@echo off
chcp 65001 >nul
echo.
echo ============================================
echo   My Calendar - 설치 시작
echo ============================================
echo.

:: Node.js 확인
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [오류] Node.js가 설치되어 있지 않습니다.
    echo https://nodejs.org 에서 설치 후 다시 실행하세요.
    pause
    exit /b 1
)

echo [1/4] npm 패키지 설치 중...
call npm install
if %errorlevel% neq 0 (
    echo [오류] npm install 실패
    pause
    exit /b 1
)

echo.
echo [2/4] .env.local 파일 확인 중...
if not exist ".env.local" (
    copy ".env.example" ".env.local" >nul
    echo .env.local 파일이 생성되었습니다.
    echo.
    echo !! 중요: .env.local 파일을 열어 API 키를 입력해주세요 !!
    echo.
    echo 필요한 키:
    echo   1. GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET
    echo      - console.cloud.google.com 에서 발급
    echo   2. NEXTAUTH_SECRET
    echo      - 아무 랜덤 문자열 입력 가능
    echo   3. ANTHROPIC_API_KEY
    echo      - console.anthropic.com 에서 발급
    echo.
    pause
) else (
    echo .env.local 이미 존재합니다.
)

echo.
echo [3/4] 데이터베이스 초기화 중...
call npx prisma db push
if %errorlevel% neq 0 (
    echo [오류] 데이터베이스 초기화 실패
    pause
    exit /b 1
)

echo.
echo [4/4] 설치 완료!
echo.
echo ============================================
echo   실행 방법: npm run dev
echo   접속 주소: http://localhost:3000
echo ============================================
echo.
pause
