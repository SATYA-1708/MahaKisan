@echo off
echo =========================================================================
echo    MahaKisan Rakshak (महाकिसान रक्षक) - SIH Problem Statement 26131
echo    Govt of Maharashtra - Early Detection, Risk Forecasting & IPM System
echo =========================================================================
echo.
echo Starting FastAPI Backend on http://127.0.0.1:8080 ...
start "MahaKisan Backend (FastAPI)" cmd /k "cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8080 --reload"

echo Starting React + Vite Frontend on http://localhost:5180 ...
start "MahaKisan Frontend (React/Vite)" cmd /k "cd frontend && npm run dev"

echo.
echo System launched!
echo - Frontend UI: http://localhost:5180
echo - Backend API & Docs: http://127.0.0.1:8080/docs
echo =========================================================================
pause
