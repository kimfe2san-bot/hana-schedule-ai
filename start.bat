@echo off
chcp 65001 >nul
echo.
echo =============================================
echo   My Calendar 개발 서버 시작
echo =============================================
echo.

set PATH=C:\Users\User\nodejs;%PATH%

cd /d %~dp0

:: node 확인
where node >nul 2>nul
if %errorlevel% neq 0 (
  echo [오류] Node.js를 찾을 수 없습니다.
  echo C:\Users\User\nodejs\node.exe 가 존재하는지 확인하세요.
  pause
  exit /b 1
)

echo 서버 시작 중... (처음에는 10-15초 걸릴 수 있어요)
echo 준비되면 브라우저에서 아래 주소로 접속하세요:
echo.
echo   http://localhost:3000
echo.
echo 종료하려면 이 창에서 Ctrl+C 를 누르세요.
echo.

npm run dev
