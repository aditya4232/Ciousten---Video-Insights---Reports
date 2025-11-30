"""
Project management and dataset card API routes.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import json
from app.db import get_db, Project
from app.schemas import DatasetCard, ProjectStatus
from app.core.openrouter_client import openrouter_client

router = APIRouter()

@router.post("/projects/{project_id}/dataset-card", response_model=DatasetCard)
async def generate_dataset_card(
    project_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Generate a dataset card for the project using OpenRouter.
    """
    # Get project
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if not project.analysis_json:
        raise HTTPException(status_code=400, detail="Project must be analyzed first")
        
    analysis_data = json.loads(project.analysis_json)
    
    project_summary = {
        "filename": project.video_filename,
        "created_at": str(project.created_at),
        "analysis_type": project.analysis_type
    }
    
    try:
        card_data = await openrouter_client.generate_dataset_card(
            project_summary=project_summary,
            analysis_summary=analysis_data
        )
        
        if "error" in card_data:
             raise HTTPException(status_code=500, detail=f"Failed to generate card: {card_data.get('error')}")

        return DatasetCard(**card_data)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Dataset card generation failed: {str(e)}")
