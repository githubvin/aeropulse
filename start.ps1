Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host " AeroPulse BRICS: Cross-Border Climate Action & Source Attribution" -ForegroundColor White
Write-Host " Build with AI: Code for Communities (Second Edition) - Google Cloud" -ForegroundColor Yellow
Write-Host "=====================================================================" -ForegroundColor Cyan

Write-Host "`n[1/2] Starting Python FastAPI Backend on http://localhost:8000 ..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

Write-Host "[2/2] Starting Frontend Vite Server on http://localhost:5173 ..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host "`n=====================================================================" -ForegroundColor Cyan
Write-Host " System Initialized Successfully!" -ForegroundColor White
Write-Host " Web Application: http://localhost:5173" -ForegroundColor Cyan
Write-Host " FastAPI Docs:    http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "=====================================================================" -ForegroundColor Cyan
