"""
FastAPI main application.
Ciousten - Video Insights & Reports
Made by Aditya Shenvi @2025 (www.adityacuz.dev)
"""
from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict
from datetime import datetime
import uuid
from app.config import settings
from app.api.routes import upload, projects, segment, analyze, reports, sample
from app.db import init_db

# In-memory session storage (cleared on restart)
active_sessions: Dict[str, dict] = {}

class SessionCreate(BaseModel):
    name: str
    device: Optional[str] = "Unknown"
    timezone: Optional[str] = "UTC"
    user_agent: Optional[str] = None

class SessionResponse(BaseModel):
    session_id: str
    name: str
    device: str
    timezone: str
    created_at: str
    message: str

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables
    print("🚀 Starting Ciousten backend...")
    await init_db()
    print("✅ Database initialized")
    
    # Ensure directories exist
    Path(settings.data_dir).mkdir(parents=True, exist_ok=True)
    Path(settings.reports_dir).mkdir(parents=True, exist_ok=True)
    print("✅ Directories ready")
    
    yield
    
    # Shutdown - clear all sessions
    active_sessions.clear()
    print("👋 Shutting down Ciousten backend...")



# Create FastAPI app
app = FastAPI(
    title="Ciousten API",
    description="Video Insights & Reports - Made by Aditya Shenvi @2025",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware - Allow all origins for public API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,  # Must be False when using "*"
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Include Routers
app.include_router(upload.router, prefix="/api", tags=["Upload"])
app.include_router(projects.router, prefix="/api", tags=["Projects"])
app.include_router(segment.router, prefix="/api", tags=["Segmentation"])
app.include_router(analyze.router, prefix="/api", tags=["Analysis"])
app.include_router(reports.router, prefix="/api", tags=["Reports"])
app.include_router(sample.router, prefix="/api", tags=["Sample"])

@app.get("/")
async def root():
    return {
        "message": "Ciousten - Video Insights & Reports API",
        "version": "1.0.0",
        "author": "Aditya Shenvi @2025",
        "website": "www.adityacuz.dev",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


# Session Management Endpoints
@app.post("/api/session", response_model=SessionResponse, tags=["Session"])
async def create_session(session_data: SessionCreate, request: Request):
    """Create a temporary session for the user."""
    session_id = str(uuid.uuid4())
    
    session = {
        "session_id": session_id,
        "name": session_data.name,
        "device": session_data.device,
        "timezone": session_data.timezone,
        "user_agent": session_data.user_agent or request.headers.get("user-agent", "Unknown"),
        "ip": request.client.host if request.client else "Unknown",
        "created_at": datetime.utcnow().isoformat(),
    }
    
    active_sessions[session_id] = session
    
    return SessionResponse(
        session_id=session_id,
        name=session_data.name,
        device=session_data.device,
        timezone=session_data.timezone,
        created_at=session["created_at"],
        message=f"Welcome, {session_data.name}! Session created."
    )


@app.get("/api/session/{session_id}", tags=["Session"])
async def get_session(session_id: str):
    """Get session info."""
    if session_id in active_sessions:
        return active_sessions[session_id]
    return {"error": "Session not found", "valid": False}


@app.delete("/api/session/{session_id}", tags=["Session"])
async def delete_session(session_id: str):
    """Delete session when user leaves."""
    if session_id in active_sessions:
        name = active_sessions[session_id]["name"]
        del active_sessions[session_id]
        return {"message": f"Goodbye, {name}! Session deleted.", "success": True}
    return {"message": "Session not found", "success": False}


@app.get("/api/sessions/active", tags=["Session"])
async def get_active_sessions():
    """Get count of active sessions."""
    return {
        "active_sessions": len(active_sessions),
        "sessions": [{"name": s["name"], "device": s["device"], "timezone": s["timezone"]} 
                     for s in active_sessions.values()]
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

