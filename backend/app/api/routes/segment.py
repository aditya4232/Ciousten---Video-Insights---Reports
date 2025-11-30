"""
Video segmentation API route.
"""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pathlib import Path
import json
import time
import cv2
from app.db import get_db, Project
from app.schemas import SegmentationResponse, SegmentationStats, ProjectStatus
from app.config import settings
from app.utils.frame_extractor import extract_frames, load_frame
from app.core.yolo_engine import yolo_engine
from app.core.sam2_engine import sam2_engine

router = APIRouter()


async def process_segmentation(project_id: str, db_session):
    """Background task to process video segmentation."""
    async with db_session() as db:
        # Get project
        result = await db.execute(select(Project).where(Project.id == project_id))
        project = result.scalar_one_or_none()
        
        if not project:
            return
        
        try:
            # Update status
            project.status = ProjectStatus.SEGMENTING
            await db.commit()
            
            start_time = time.time()
            
            # Extract frames
            frames_dir = Path(settings.data_dir) / "frames" / project_id
            frames_dir.mkdir(parents=True, exist_ok=True)
            
            frame_paths, video_metadata = extract_frames(
                video_path=project.video_path,
                output_dir=str(frames_dir),
                fps=settings.frame_extraction_fps
            )
            
            # Load AI models
            yolo_engine.load_model()
            sam2_engine.load_model()
            
            # Process each frame
            all_frames_data = []
            objects_per_class = {}
            total_objects = 0
            
            for idx, frame_path in enumerate(frame_paths):
                # Load frame
                frame_bgr = load_frame(frame_path)
                frame_rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
                
                # Detect objects with YOLO
                detections = yolo_engine.detect_objects(frame_bgr)
                
                # Segment with SAM2 (if available)
                detections = sam2_engine.segment_objects(frame_rgb, detections)
                
                # Process detections
                frame_objects = []
                for i, det in enumerate(detections):
                    obj_data = {
                        'id': i,
                        'class_name': det['class_name'],
                        'bbox': det['bbox'],
                        'confidence': det['confidence']
                    }
                    
                    # Save mask if available
                    if 'mask' in det:
                        mask_path = frames_dir / f"frame_{idx:04d}_mask_{i}.png"
                        # Save mask as image
                        mask_img = (det['mask'] * 255).astype('uint8')
                        cv2.imwrite(str(mask_path), mask_img)
                        obj_data['mask_path'] = str(mask_path)
                    
                    frame_objects.append(obj_data)
                    
                    # Update class counts
                    class_name = det['class_name']
                    objects_per_class[class_name] = objects_per_class.get(class_name, 0) + 1
                    total_objects += 1
                
                # Store frame data
                timestamp = idx / settings.frame_extraction_fps
                frame_data = {
                    'frame_index': idx,
                    'timestamp': timestamp,
                    'objects': frame_objects
                }
                all_frames_data.append(frame_data)
            
            # Calculate statistics
            processing_time = time.time() - start_time
            total_frames = len(frame_paths)
            avg_objects_per_frame = total_objects / total_frames if total_frames > 0 else 0
            
            # Save segmentation results
            segmentation_data = {
                'video_metadata': video_metadata,
                'frames': all_frames_data,
                'stats': {
                    'total_frames': total_frames,
                    'total_objects': total_objects,
                    'objects_per_class': objects_per_class,
                    'avg_objects_per_frame': avg_objects_per_frame,
                    'processing_time_seconds': processing_time
                }
            }
            
            segmentation_json_path = frames_dir / "segmentation_results.json"
            with open(segmentation_json_path, 'w') as f:
                json.dump(segmentation_data, f, indent=2)
            
            # Update project
            project.status = ProjectStatus.SEGMENTED
            project.total_frames = total_frames
            project.total_objects = total_objects
            project.segmentation_json_path = str(segmentation_json_path)
            project.segmentation_time = processing_time
            
            await db.commit()
            
        except Exception as e:
            project.status = ProjectStatus.FAILED
            await db.commit()
            print(f"Segmentation failed for project {project_id}: {e}")


@router.post("/segment-video/{project_id}", response_model=SegmentationResponse)
async def segment_video(
    project_id: str,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    """
    Start video segmentation process.
    
    Args:
        project_id: Project identifier
        background_tasks: FastAPI background tasks
        db: Database session
    
    Returns:
        SegmentationResponse with status
    """
    # Get project
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if project.status != ProjectStatus.UPLOADED:
        raise HTTPException(
            status_code=400,
            detail=f"Project status must be 'uploaded', current: {project.status}"
        )
    
    # Start background processing
    from app.db import AsyncSessionLocal
    background_tasks.add_task(process_segmentation, project_id, AsyncSessionLocal)
    
    return SegmentationResponse(
        project_id=project_id,
        status=ProjectStatus.SEGMENTING,
        stats=SegmentationStats(
            total_frames=0,
            total_objects=0,
            objects_per_class={},
            avg_objects_per_frame=0.0,
            processing_time_seconds=0.0
        ),
        message="Segmentation started. Check project status for progress."
    )


@router.get("/segment-video/{project_id}/status")
async def get_segmentation_status(
    project_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get segmentation status for a project."""
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Load segmentation data if available
    stats = None
    if project.segmentation_json_path and Path(project.segmentation_json_path).exists():
        with open(project.segmentation_json_path, 'r') as f:
            seg_data = json.load(f)
            stats = seg_data.get('stats', {})
    
    return {
        'project_id': project_id,
        'status': project.status,
        'stats': stats
    }
