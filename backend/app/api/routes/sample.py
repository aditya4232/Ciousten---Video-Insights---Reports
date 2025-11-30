from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
import shutil
import uuid
import os
from datetime import datetime
from pathlib import Path
from app.db import get_db, Project
from app.schemas import VideoUploadResponse, ProjectStatus
from app.config import settings

router = APIRouter()

# Path relative to backend directory
SAMPLE_VIDEO_PATH = Path("../sample/24541-343454486_small.mp4")

@router.post("/sample", response_model=VideoUploadResponse)
async def create_sample_project(db: AsyncSession = Depends(get_db)):
    """
    Create a new project using the pre-loaded sample video.
    """
    if not SAMPLE_VIDEO_PATH.exists():
        raise HTTPException(status_code=404, detail=f"Sample video not found at {SAMPLE_VIDEO_PATH.absolute()}")

    # Generate project ID
    project_id = str(uuid.uuid4())
    filename = "sample_traffic_video.mp4"
    
    # Create project directory
    project_dir = Path(settings.data_dir) / "videos" / project_id
    project_dir.mkdir(parents=True, exist_ok=True)
    
    # Copy sample video to project directory
    destination_path = project_dir / filename
    try:
        shutil.copy(SAMPLE_VIDEO_PATH, destination_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to copy sample video: {str(e)}")
        
    # Get file size
    file_size = destination_path.stat().st_size

    # Create DB entry
    new_project = Project(
        id=project_id,
        video_filename=filename,
        video_path=str(destination_path),
        file_size=file_size,
        status=ProjectStatus.UPLOADED,
        created_at=datetime.utcnow()
    )
    
    db.add(new_project)
    await db.commit()
    await db.refresh(new_project)
    
    return VideoUploadResponse(
        project_id=project_id,
        filename=filename,
        file_size=file_size,
        status=ProjectStatus.UPLOADED,
        message="Sample project created successfully"
    )
