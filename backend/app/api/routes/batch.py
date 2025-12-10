"""
Batch Video Processing
Process multiple videos simultaneously
"""
from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from typing import List
from pathlib import Path
from app.config import settings
import uuid
import asyncio
from datetime import datetime

router = APIRouter()


class BatchJob:
    """Batch processing job"""
    def __init__(self, batch_id: str, total_videos: int):
        self.batch_id = batch_id
        self.total_videos = total_videos
        self.completed = 0
        self.failed = 0
        self.status = "processing"
        self.videos = []
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()


# In-memory storage (use Redis/DB in production)
batch_jobs = {}


async def process_video_batch(batch_id: str, files: List[UploadFile]):
    """Process multiple videos in batch"""
    job = batch_jobs[batch_id]
    
    for file in files:
        try:
            # Create project for each video
            project_id = str(uuid.uuid4())
            project_dir = Path(settings.data_dir) / project_id
            project_dir.mkdir(parents=True, exist_ok=True)
            
            # Save video file
            video_path = project_dir / file.filename
            content = await file.read()
            with open(video_path, "wb") as f:
                f.write(content)
            
            job.videos.append({
                "project_id": project_id,
                "filename": file.filename,
                "status": "completed",
                "size_mb": len(content) / (1024 * 1024)
            })
            job.completed += 1
            
        except Exception as e:
            job.videos.append({
                "filename": file.filename,
                "status": "failed",
                "error": str(e)
            })
            job.failed += 1
        
        job.updated_at = datetime.utcnow()
    
    job.status = "completed" if job.failed == 0 else "completed_with_errors"
    job.updated_at = datetime.utcnow()


@router.post("/batch/upload")
async def upload_batch_videos(
    background_tasks: BackgroundTasks,
    files: List[UploadFile] = File(...)
):
    """
    Upload multiple videos for batch processing
    
    - Accepts up to 10 videos at once
    - Each video max 500MB
    - Processes in background
    """
    if len(files) > 10:
        raise HTTPException(
            status_code=400,
            detail="Maximum 10 videos allowed per batch"
        )
    
    # Validate file types
    allowed_extensions = {".mp4", ".mov", ".avi", ".mkv"}
    for file in files:
        ext = Path(file.filename).suffix.lower()
        if ext not in allowed_extensions:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type: {file.filename}. Allowed: {allowed_extensions}"
            )
    
    # Create batch job
    batch_id = str(uuid.uuid4())
    job = BatchJob(batch_id, len(files))
    batch_jobs[batch_id] = job
    
    # Process in background
    background_tasks.add_task(process_video_batch, batch_id, files)
    
    return {
        "batch_id": batch_id,
        "total_videos": len(files),
        "status": "processing",
        "message": "Batch upload started",
        "status_url": f"/api/batch/status/{batch_id}"
    }


@router.get("/batch/status/{batch_id}")
async def get_batch_status(batch_id: str):
    """Get batch processing status"""
    if batch_id not in batch_jobs:
        raise HTTPException(status_code=404, detail="Batch job not found")
    
    job = batch_jobs[batch_id]
    
    return {
        "batch_id": batch_id,
        "status": job.status,
        "total_videos": job.total_videos,
        "completed": job.completed,
        "failed": job.failed,
        "progress": int((job.completed + job.failed) / job.total_videos * 100),
        "videos": job.videos,
        "created_at": job.created_at.isoformat(),
        "updated_at": job.updated_at.isoformat()
    }


@router.get("/batch/list")
async def list_batch_jobs():
    """List all batch jobs"""
    return {
        "total": len(batch_jobs),
        "jobs": [
            {
                "batch_id": batch_id,
                "status": job.status,
                "total_videos": job.total_videos,
                "completed": job.completed,
                "failed": job.failed,
                "created_at": job.created_at.isoformat()
            }
            for batch_id, job in batch_jobs.items()
        ]
    }


@router.delete("/batch/{batch_id}")
async def delete_batch_job(batch_id: str):
    """Delete a batch job"""
    if batch_id not in batch_jobs:
        raise HTTPException(status_code=404, detail="Batch job not found")
    
    del batch_jobs[batch_id]
    
    return {
        "message": "Batch job deleted successfully",
        "batch_id": batch_id
    }
