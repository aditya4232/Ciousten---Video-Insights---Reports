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
    """Background task to process video segmentation with tracking and visualization."""
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
            
            # Setup paths
            frames_dir = Path(settings.data_dir) / "frames" / project_id
            frames_dir.mkdir(parents=True, exist_ok=True)
            
            output_video_path = Path(settings.data_dir) / "videos" / project_id / "output_tracked.mp4"
            
            # Extract frames
            frame_paths, video_metadata = extract_frames(
                video_path=project.video_path,
                output_dir=str(frames_dir),
                fps=settings.frame_extraction_fps
            )
            
            # Load AI models
            yolo_engine.load_model()
            sam2_engine.load_model()
            
            # Initialize annotators
            import supervision as sv
            box_annotator = sv.BoxAnnotator()
            mask_annotator = sv.MaskAnnotator()
            label_annotator = sv.LabelAnnotator()
            
            # Prepare video writer
            first_frame = cv2.imread(frame_paths[0])
            height, width, _ = first_frame.shape
            fourcc = cv2.VideoWriter_fourcc(*'mp4v')
            video_writer = cv2.VideoWriter(str(output_video_path), fourcc, settings.frame_extraction_fps, (width, height))
            
            # Process each frame
            all_frames_data = []
            objects_per_class = {}
            total_objects = 0
            unique_ids = set()
            
            total_frames_count = len(frame_paths)
            
            for idx, frame_path in enumerate(frame_paths):
                # Update progress every 5 frames or on last frame
                if idx % 5 == 0 or idx == total_frames_count - 1:
                    progress_percent = int((idx / total_frames_count) * 100)
                    project.progress = progress_percent
                    project.status_message = f"Processing frame {idx + 1}/{total_frames_count}"
                    await db.commit()

                # Load frame
                frame_bgr = cv2.imread(frame_path)
                frame_rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
                
                # Detect and Track with YOLO + ByteTrack
                detections = yolo_engine.detect_and_track(frame_bgr)
                
                # Segment with SAM2
                detections = sam2_engine.segment_objects(frame_rgb, detections)
                
                # Annotate frame
                annotated_frame = frame_bgr.copy()
                annotated_frame = mask_annotator.annotate(scene=annotated_frame, detections=detections)
                annotated_frame = box_annotator.annotate(scene=annotated_frame, detections=detections)
                
                # Create labels
                labels = []
                for i in range(len(detections)):
                    tracker_id = detections.tracker_id[i] if detections.tracker_id is not None else -1
                    class_id = detections.class_id[i]
                    class_name = detections.data['class_name'][i]
                    confidence = detections.confidence[i]
                    labels.append(f"#{tracker_id} {class_name} {confidence:.2f}")
                    
                    # Update stats
                    unique_ids.add(tracker_id)
                    objects_per_class[class_name] = objects_per_class.get(class_name, 0) + 1
                    total_objects += 1
                
                annotated_frame = label_annotator.annotate(scene=annotated_frame, detections=detections, labels=labels)
                
                # Write to video
                video_writer.write(annotated_frame)
                
                # Prepare data for JSON
                frame_objects = []
                for i in range(len(detections)):
                    tracker_id = int(detections.tracker_id[i]) if detections.tracker_id is not None else -1
                    class_name = detections.data['class_name'][i]
                    bbox = detections.xyxy[i].tolist()
                    confidence = float(detections.confidence[i])
                    
                    obj_data = {
                        'id': tracker_id,
                        'class_name': class_name,
                        'bbox': bbox,
                        'confidence': confidence
                    }
                    
                    # Save mask if available
                    if detections.mask is not None:
                        mask_path = frames_dir / f"frame_{idx:04d}_mask_{i}.png"
                        mask_img = (detections.mask[i] * 255).astype('uint8')
                        cv2.imwrite(str(mask_path), mask_img)
                        obj_data['mask_path'] = str(mask_path)
                    
                    frame_objects.append(obj_data)
                
                # Store frame data
                timestamp = idx / settings.frame_extraction_fps
                frame_data = {
                    'frame_index': idx,
                    'timestamp': timestamp,
                    'objects': frame_objects
                }
                all_frames_data.append(frame_data)
            
            video_writer.release()
            
            # Finalize progress
            project.progress = 100
            project.status_message = "Finalizing results..."
            await db.commit()
            
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
                    'unique_objects': len(unique_ids),
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
            project.annotated_video_path = str(output_video_path) # Add this field to schema if not exists
            
            await db.commit()
            
        except Exception as e:
            import traceback
            traceback.print_exc()
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
        'progress': project.progress,
        'status_message': project.status_message,
        'stats': stats
    }
