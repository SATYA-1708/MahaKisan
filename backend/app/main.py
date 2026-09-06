import time
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router
from app.core.system_monitor import system_monitor

app = FastAPI(
    title="Fasal Rakshak API (फसल रक्षक)",
    description="Early Detection, Risk Forecasting & Integrated Pest Management Platform (SIH 26131)",
    version="2.4.0"
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Latency & Monitoring Middleware
@app.middleware("http")
async def monitor_middleware(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    duration_ms = (time.time() - start) * 1000.0
    if not request.url.path.startswith("/api/system"):
        system_monitor.log_request(duration_ms)
    return response

# Include main router
app.include_router(router, prefix="/api")

@app.get("/")
def root():
    return {
        "platform": "Fasal Rakshak (फसल रक्षक)",
        "organization": "Department of Agriculture",
        "department": "Department of Agriculture",
        "sih_problem_id": "26131",
        "status": "OPERATIONAL",
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
