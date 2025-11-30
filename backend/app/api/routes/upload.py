"""
Video upload API route.
"""

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pathlib import Path
import uuid
import shutil
from app.db import get_db, Project
from app.schemas import VideoUploadResponse, ProjectStatus
from app.config import settings

router = APIRouter()


@router.post("/upload-video", response_model=VideoUploadResponse)
async def upload_video(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    """
    Upload a video file and create a new project.
    
    Args:
        file: Video file upload
        db: Database session
    
    Returns:
        VideoUploadResponse with project_id and metadata
    """
    # Validate file type
    allowed_extensions = ['.mp4', '.mov', '.avi', '.mkv']
    file_ext = Path(file.filename).suffix.lower()
    
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: {', '.join(allowed_extensions)}"
        )
    
    # Generate project ID
    project_id = str(uuid.uuid4())
    
    # Create project directory
    project_dir = Path(settings.data_dir) / "videos" / project_id
    project_dir.mkdir(parents=True, exist_ok=True)
    
    # Save video file
    video_filename = file.filename
    video_path = project_dir / video_filename
    
    # Stream file to disk
    with open(video_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Get file size
    file_size = video_path.stat().st_size
    
    # Check file size limit
    max_size_bytes = settings.max_video_size_mb * 1024 * 1024
    if file_size > max_size_bytes:
        # Clean up
        shutil.rmtree(project_dir)
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size: {settings.max_video_size_mb}MB"
        )
    
    # Create project record
    project = Project(
        id=project_id,
        video_filename=video_filename,
        video_path=str(video_path),
        file_size=file_size,
        status=ProjectStatus.UPLOADED
    )
    
    db.add(project)
    await db.commit()
    await db.refresh(project)
    
    return VideoUploadResponse(
        project_id=project_id,
        filename=video_filename,
        file_size=file_size,
        status=ProjectStatus.UPLOADED,
        message=f"Video uploaded successfully. Project ID: {project_id}"
    )
