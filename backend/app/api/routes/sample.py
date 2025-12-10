from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
import shutil
import uuid
import os
import httpx
from datetime import datetime
from pathlib import Path
from app.db import get_db, Project
from app.schemas import VideoUploadResponse, ProjectStatus
from app.config import settings
from app.rate_limit import limiter, RATE_LIMITS

router = APIRouter()

# Path to sample video (absolute path works in Docker)
SAMPLE_VIDEO_PATH = Path("/app/sample/24541-343454486_small.mp4")

# Public sample video URL (fallback)
SAMPLE_VIDEO_URL = "https://github.com/intel-iot-devkit/sample-videos/raw/master/people-detection.mp4"


async def ensure_sample_video_exists():
    """Download sample video if it doesn't exist"""
    if SAMPLE_VIDEO_PATH.exists():
        return True
    
    try:
        # Create sample directory
        SAMPLE_VIDEO_PATH.parent.mkdir(parents=True, exist_ok=True)
        
        # Download sample video
        async with httpx.AsyncClient() as client:
            response = await client.get(SAMPLE_VIDEO_URL, follow_redirects=True)
            if response.status_code == 200:
                with open(SAMPLE_VIDEO_PATH, 'wb') as f:
                    f.write(response.content)
                return True
    except Exception as e:
        print(f"Failed to download sample video: {e}")
        return False
    
    return False


@router.post("/sample", response_model=VideoUploadResponse)
@limiter.limit(RATE_LIMITS["sample"])  # Limit: 10 sample loads per hour
async def create_sample_project(request: Request, db: AsyncSession = Depends(get_db)):
    """
    Create a new project using the pre-loaded sample video.
    
    **Rate Limited**: 10 sample loads per hour per IP to prevent abuse.
    
    If sample video doesn't exist, it will be downloaded automatically.
    """
    # Ensure sample video exists (download if needed)
    if not await ensure_sample_video_exists():
        raise HTTPException(
            status_code=500, 
            detail="Failed to load sample video. Please try uploading your own video."
        )

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
