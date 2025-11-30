"""
Report generation and download API routes.
"""

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pathlib import Path
import json
from typing import List
from app.db import get_db, Project
from app.schemas import ReportGenerationResponse, ProjectSummary, ProjectStatus
from app.config import settings
from app.core.reporting_excel import generate_excel_report
from app.core.reporting_pdf import generate_pdf_report

router = APIRouter()


@router.post("/reports/{project_id}/generate", response_model=ReportGenerationResponse)
async def generate_reports(
    project_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Generate Excel and PDF reports for a project.
    
    Args:
        project_id: Project identifier
        db: Database session
    
    Returns:
        ReportGenerationResponse with file paths
    """
    # Get project
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if project.status != ProjectStatus.ANALYZED:
        raise HTTPException(
            status_code=400,
            detail=f"Project must be analyzed first. Current status: {project.status}"
        )
    
    # Load segmentation data
    if not project.segmentation_json_path or not Path(project.segmentation_json_path).exists():
        raise HTTPException(status_code=400, detail="Segmentation data not found")
    
    with open(project.segmentation_json_path, 'r') as f:
        segmentation_data = json.load(f)
    
    # Load analysis data
    if not project.analysis_json:
        raise HTTPException(status_code=400, detail="Analysis data not found")
    
    analysis_data = json.loads(project.analysis_json)
    
    # Prepare project data
    project_data = {
        'project_id': project_id,
        'video_filename': project.video_filename,
        'created_at': project.created_at.isoformat() if project.created_at else None
    }
    
    try:
        # Generate Excel report
        excel_filename = f"ciousten_{project_id}.xlsx"
        excel_path = Path(settings.reports_dir) / "excel" / excel_filename
        
        generate_excel_report(
            project_id=project_id,
            project_data=project_data,
            segmentation_data=segmentation_data,
            analysis_data=analysis_data,
            output_path=str(excel_path)
        )
        
        # Generate PDF report
        pdf_filename = f"ciousten_{project_id}.pdf"
        pdf_path = Path(settings.reports_dir) / "pdf" / pdf_filename
        
        generate_pdf_report(
            project_id=project_id,
            project_data=project_data,
            segmentation_data=segmentation_data,
            analysis_data=analysis_data,
            output_path=str(pdf_path)
        )
        
        # Update project
        project.excel_path = str(excel_path)
        project.pdf_path = str(pdf_path)
        project.has_reports = True
        project.status = ProjectStatus.COMPLETED
        
        await db.commit()
        
        return ReportGenerationResponse(
            project_id=project_id,
            excel_path=f"/api/reports/{project_id}/download/excel",
            pdf_path=f"/api/reports/{project_id}/download/pdf",
            message="Reports generated successfully"
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Report generation failed: {str(e)}")


@router.get("/reports/{project_id}/download/{report_type}")
async def download_report(
    project_id: str,
    report_type: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Download a generated report.
    
    Args:
        project_id: Project identifier
        report_type: 'excel' or 'pdf'
        db: Database session
    
    Returns:
        File download response
    """
    # Get project
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Get file path
    if report_type == "excel":
        file_path = project.excel_path
        media_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    elif report_type == "pdf":
        file_path = project.pdf_path
        media_type = "application/pdf"
    else:
        raise HTTPException(status_code=400, detail="Invalid report type. Use 'excel' or 'pdf'")
    
    if not file_path or not Path(file_path).exists():
        raise HTTPException(status_code=404, detail=f"{report_type.upper()} report not found")
    
    filename = Path(file_path).name
    
    return FileResponse(
        path=file_path,
        media_type=media_type,
        filename=filename
    )


@router.get("/projects", response_model=List[ProjectSummary])
async def list_projects(db: AsyncSession = Depends(get_db)):
    """
    List all projects with their status and available reports.
    
    Args:
        db: Database session
    
    Returns:
        List of project summaries
    """
    result = await db.execute(select(Project).order_by(Project.created_at.desc()))
    projects = result.scalars().all()
    
    summaries = []
    for project in projects:
        summaries.append(ProjectSummary(
            project_id=project.id,
            video_filename=project.video_filename,
            status=project.status,
            created_at=project.created_at,
            has_segmentation=project.segmentation_json_path is not None,
            has_analysis=project.analysis_json is not None,
            has_reports=project.has_reports,
            excel_path=f"/api/reports/{project.id}/download/excel" if project.excel_path else None,
            pdf_path=f"/api/reports/{project.id}/download/pdf" if project.pdf_path else None
        ))
    
    return summaries
