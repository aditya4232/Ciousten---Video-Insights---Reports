"""
URL Video Processing
Download and process videos from URLs (YouTube, direct links, etc.)
"""
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, HttpUrl
from pathlib import Path
from app.config import settings
import httpx
import yt_dlp
import uuid
from typing import Optional

router = APIRouter()


class URLVideoRequest(BaseModel):
    url: HttpUrl
    project_name: Optional[str] = None
    quality: str = "720p"  # 360p, 480p, 720p, 1080p


class VideoDownloadStatus(BaseModel):
    project_id: str
    status: str
    progress: int
    message: str
    file_path: Optional[str] = None


# In-memory storage for download status (use Redis in production)
download_status = {}


def download_from_url(url: str, project_id: str, quality: str = "720p"):
    """Download video from URL"""
    try:
        download_status[project_id] = {
            "status": "downloading",
            "progress": 0,
            "message": "Starting download..."
        }
        
        output_path = Path(settings.data_dir) / project_id
        output_path.mkdir(parents=True, exist_ok=True)
        
        # Check if it's a YouTube URL
        if "youtube.com" in url or "youtu.be" in url:
            # Use yt-dlp for YouTube
            quality_map = {
                "360p": "18",
                "480p": "135",
                "720p": "136",
                "1080p": "137"
            }
            
            ydl_opts = {
                'format': f'{quality_map.get(quality, "136")}+bestaudio/best',
                'outtmpl': str(output_path / '%(title)s.%(ext)s'),
                'progress_hooks': [lambda d: update_progress(project_id, d)],
                'merge_output_format': 'mp4',
            }
            
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=True)
                filename = ydl.prepare_filename(info)
                
                download_status[project_id] = {
                    "status": "completed",
                    "progress": 100,
                    "message": "Download completed",
                    "file_path": filename
                }
        else:
            # Direct download for other URLs
            download_status[project_id]["message"] = "Downloading from direct URL..."
            
            response = httpx.get(url, follow_redirects=True)
            if response.status_code != 200:
                raise Exception(f"Failed to download: {response.status_code}")
            
            # Get filename from URL or generate one
            filename = url.split("/")[-1] or f"video_{project_id}.mp4"
            file_path = output_path / filename
            
            with open(file_path, "wb") as f:
                f.write(response.content)
            
            download_status[project_id] = {
                "status": "completed",
                "progress": 100,
                "message": "Download completed",
                "file_path": str(file_path)
            }
            
    except Exception as e:
        download_status[project_id] = {
            "status": "error",
            "progress": 0,
            "message": f"Download failed: {str(e)}"
        }


def update_progress(project_id: str, d: dict):
    """Update download progress"""
    if d['status'] == 'downloading':
        try:
            progress = int(d.get('downloaded_bytes', 0) / d.get('total_bytes', 1) * 100)
            download_status[project_id] = {
                "status": "downloading",
                "progress": progress,
                "message": f"Downloading... {progress}%"
            }
        except:
            pass


@router.post("/url/download")
async def download_video_from_url(
    request: URLVideoRequest,
    background_tasks: BackgroundTasks
):
    """
    Download video from URL (YouTube, direct links, etc.)
    
    Supported sources:
    - YouTube (youtube.com, youtu.be)
    - Direct video URLs (mp4, mov, avi, etc.)
    
    Quality options: 360p, 480p, 720p, 1080p
    """
    project_id = str(uuid.uuid4())
    
    # Start download in background
    background_tasks.add_task(
        download_from_url,
        str(request.url),
        project_id,
        request.quality
    )
    
    return {
        "project_id": project_id,
        "status": "initiated",
        "message": "Download started. Check status endpoint for progress.",
        "status_url": f"/api/url/status/{project_id}"
    }


@router.get("/url/status/{project_id}")
async def get_download_status(project_id: str):
    """Get download status for a project"""
    if project_id not in download_status:
        raise HTTPException(status_code=404, detail="Project not found")
    
    status = download_status[project_id]
    return VideoDownloadStatus(
        project_id=project_id,
        **status
    )


@router.get("/url/supported-sites")
async def get_supported_sites():
    """Get list of supported video sites"""
    return {
        "supported": [
            {
                "name": "YouTube",
                "domains": ["youtube.com", "youtu.be"],
                "features": ["Multiple qualities", "Subtitles", "Playlists"]
            },
            {
                "name": "Direct URLs",
                "domains": ["Any domain"],
                "features": ["MP4, MOV, AVI, MKV formats"]
            }
        ],
        "qualities": ["360p", "480p", "720p", "1080p"],
        "note": "YouTube downloads require yt-dlp to be installed"
    }
