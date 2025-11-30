"""
AI analysis API route using OpenRouter.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pathlib import Path
import json
from app.db import get_db, Project
from app.schemas import AnalysisRequest, AnalysisResponse, AnalysisResult, ProjectStatus
from app.core.openrouter_client import openrouter_client

router = APIRouter()


@router.post("/analyze/{project_id}", response_model=AnalysisResponse)
async def analyze_video(
    project_id: str,
    request: AnalysisRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Run AI analysis on segmented video using OpenRouter.
    
    Args:
        project_id: Project identifier
        request: Analysis request parameters
        db: Database session
    
    Returns:
        AnalysisResponse with AI-generated insights
    """
    # Get project
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if project.status not in [ProjectStatus.SEGMENTED, ProjectStatus.ANALYZED]:
        raise HTTPException(
            status_code=400,
            detail=f"Project must be segmented first. Current status: {project.status}"
        )
    
    # Load segmentation data
    if not project.segmentation_json_path or not Path(project.segmentation_json_path).exists():
        raise HTTPException(status_code=400, detail="Segmentation data not found")
    
    with open(project.segmentation_json_path, 'r') as f:
        segmentation_data = json.load(f)
    
    # Prepare metadata for analysis
    stats = segmentation_data.get('stats', {})
    frames = segmentation_data.get('frames', [])
    
    # Get sample frames (first 5 and frames with most objects)
    sample_frames = []
    for frame in frames[:5]:
        sample_frames.append({
            'frame_index': frame['frame_index'],
            'timestamp': frame['timestamp'],
            'object_count': len(frame['objects']),
            'classes': list(set(obj['class_name'] for obj in frame['objects']))
        })
    
    # Add frames with highest object counts
    sorted_frames = sorted(frames, key=lambda x: len(x['objects']), reverse=True)
    for frame in sorted_frames[:3]:
        if frame not in frames[:5]:
            sample_frames.append({
                'frame_index': frame['frame_index'],
                'timestamp': frame['timestamp'],
                'object_count': len(frame['objects']),
                'classes': list(set(obj['class_name'] for obj in frame['objects']))
            })
    
    metadata = {
        'total_frames': stats.get('total_frames', 0),
        'total_objects': stats.get('total_objects', 0),
        'avg_objects_per_frame': stats.get('avg_objects_per_frame', 0),
        'objects_per_class': stats.get('objects_per_class', {}),
        'sample_frames': sample_frames
    }
    
    # Update status
    project.status = ProjectStatus.ANALYZING
    await db.commit()
    
    try:
        # Call OpenRouter for analysis
        analysis_result = await openrouter_client.analyze_video_metadata(
            metadata=metadata,
            analysis_type=request.analysis_type,
            model=request.model
        )
        
        # Validate response structure
        if 'error' in analysis_result:
            raise HTTPException(
                status_code=500,
                detail=f"AI analysis failed: {analysis_result.get('error')}"
            )
        
        # Ensure required fields exist
        required_fields = ['summary', 'key_findings', 'anomalies', 'dataset_plan', 'kpis']
        for field in required_fields:
            if field not in analysis_result:
                analysis_result[field] = [] if field != 'summary' else "No analysis available"
        
        # Store analysis results
        project.analysis_json = json.dumps(analysis_result)
        project.analysis_model = request.model
        project.analysis_type = request.analysis_type
        project.status = ProjectStatus.ANALYZED
        
        await db.commit()
        
        # Create response
        return AnalysisResponse(
            project_id=project_id,
            status=ProjectStatus.ANALYZED,
            analysis=AnalysisResult(**analysis_result),
            model_used=request.model,
            message="Analysis completed successfully"
        )
    
    except Exception as e:
        project.status = ProjectStatus.SEGMENTED
        await db.commit()
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
