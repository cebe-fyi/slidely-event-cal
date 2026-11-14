@echo off
cd /d "%~dp0"
echo.
echo Starting your local Slidely calendar...
echo When Ready appears below, open http://127.0.0.1:3000 in your browser.
echo Keep this window open while using the calendar. Close it to stop.
echo.
if not exist "node_modules\next\package.json" (
  echo Dependencies are missing. Ask Codex to install them first.
  pause
  exit /b 1
)
call npm run dev
pause
