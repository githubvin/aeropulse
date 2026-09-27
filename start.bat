@echo off
echo =====================================================================
echo  AeroPulse BRICS: Cross-Border Climate Action & Source Attribution
echo  Build with AI: Code for Communities (Second Edition) - Google Cloud
echo =====================================================================
echo.

echo [1/2] Starting Python FastAPI Backend on http://localhost:8000 ...
start "AeroPulse Backend" cmd /k "cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

echo [2/2] Starting Frontend Vite Server on http://localhost:5173 ...
start "AeroPulse Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo =====================================================================
echo  System Initialized Successfully!
echo  Web Application: http://localhost:5173
echo  FastAPI Docs:    http://localhost:8000/docs
echo =====================================================================
