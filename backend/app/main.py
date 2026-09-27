import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .config import settings
from .routes import (
    attribution,
    corridors,
    simulation,
    alerts,
    federated,
    policy,
    citizen
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Cross-Border AI Climate Intelligence & Industrial Source Attribution Network for BRICS Nations",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for frontend applications (supports Vercel, localhost, Render)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(attribution.router, prefix=settings.API_V1_STR)
app.include_router(corridors.router, prefix=settings.API_V1_STR)
app.include_router(simulation.router, prefix=settings.API_V1_STR)
app.include_router(alerts.router, prefix=settings.API_V1_STR)
app.include_router(federated.router, prefix=settings.API_V1_STR)
app.include_router(policy.router, prefix=settings.API_V1_STR)
app.include_router(citizen.router, prefix=settings.API_V1_STR)

@app.get("/api/health")
def root_health_check():
    return {
        "status": "online",
        "platform": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "hackathon": "Build with AI: Code for Communities (Second Edition)",
        "google_ai_integration": "Gemini 2.0 Flash (google-genai SDK)",
        "docs_url": "/docs"
    }

# If frontend/dist exists (production build), serve frontend static files at root
dist_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))
if os.path.exists(dist_dir):
    app.mount("/", StaticFiles(directory=dist_dir, html=True), name="static")
else:
    @app.get("/")
    def fallback_root():
        return root_health_check()

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)
