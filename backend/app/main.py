"""
FastAPI main application.
Ciousten - Video Insights & Reports
Made by Aditya Shenvi @2025 (www.adityacuz.dev)
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from app.db import init_db
from app.api.routes import upload, segment, analyze, reports, projects
from app.config import settings
from pathlib import Path


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    # Startup
    print("🚀 Starting Ciousten backend...")
    await init_db()
    print("✓ Database initialized")
    
    # Ensure directories exist
    Path(settings.data_dir).mkdir(parents=True, exist_ok=True)
    Path(settings.reports_dir).mkdir(parents=True, exist_ok=True)
    
    yield
    
    # Shutdown
    print("👋 Shutting down Ciousten backend...")


# Create FastAPI app
app = FastAPI(
    title="Ciousten API",
    description="Video Insights & Reports - Made by Aditya Shenvi @2025",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(upload.router, prefix="/api", tags=["Upload"])
app.include_router(segment.router, prefix="/api", tags=["Segmentation"])
app.include_router(analyze.router, prefix="/api", tags=["Analysis"])
app.include_router(reports.router, prefix="/api", tags=["Reports"])
app.include_router(projects.router, prefix="/api", tags=["Projects"])


@app.get("/")
async def root():
    """Root endpoint."""
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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
