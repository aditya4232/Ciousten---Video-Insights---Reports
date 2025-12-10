"""
Dataset Export Routes
Export segmentation data to COCO and YOLO formats
"""
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pathlib import Path
from app.core.coco_exporter import COCOExporter
from app.config import settings
import shutil
import zipfile

router = APIRouter()


@router.post("/export/{project_id}/coco")
async def export_coco(project_id: str):
    """
    Export project data to COCO format.
    
    Returns a ZIP file containing:
    - annotations.json (COCO format)
    - images/ directory with all frames
    """
    project_dir = Path(settings.data_dir) / project_id
    
    if not project_dir.exists():
        raise HTTPException(status_code=404, detail="Project not found")
    
    try:
        exporter = COCOExporter(project_id, project_dir)
        result = exporter.export_to_coco()
        
        # Create ZIP file
        zip_path = project_dir / f"{project_id}_coco.zip"
        export_dir = Path(result["export_path"])
        
        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for file in export_dir.rglob('*'):
                if file.is_file():
                    zipf.write(file, file.relative_to(export_dir))
        
        return {
            "success": True,
            "project_id": project_id,
            "format": "coco",
            "download_url": f"/api/export/download/{project_id}_coco.zip",
            "statistics": {
                "images": result["images_count"],
                "annotations": result["annotations_count"],
                "categories": result["categories_count"]
            },
            "categories": result["categories"]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")


@router.post("/export/{project_id}/yolo")
async def export_yolo(project_id: str):
    """
    Export project data to YOLO format.
    
    Returns a ZIP file containing:
    - data.yaml (YOLO dataset config)
    - classes.txt (class names)
    - images/ directory
    - labels/ directory
    """
    project_dir = Path(settings.data_dir) / project_id
    
    if not project_dir.exists():
        raise HTTPException(status_code=404, detail="Project not found")
    
    try:
        exporter = COCOExporter(project_id, project_dir)
        result = exporter.export_to_yolo()
        
        # Create ZIP file
        zip_path = project_dir / f"{project_id}_yolo.zip"
        export_dir = Path(result["export_path"])
        
        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for file in export_dir.rglob('*'):
                if file.is_file():
                    zipf.write(file, file.relative_to(export_dir))
        
        return {
            "success": True,
            "project_id": project_id,
            "format": "yolo",
            "download_url": f"/api/export/download/{project_id}_yolo.zip",
            "statistics": {
                "classes": result["classes_count"]
            },
            "classes": result["classes"]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")


@router.get("/export/download/{filename}")
async def download_export(filename: str):
    """Download exported dataset file"""
    
    # Search for file in all project directories
    data_dir = Path(settings.data_dir)
    
    for project_dir in data_dir.iterdir():
        if project_dir.is_dir():
            file_path = project_dir / filename
            if file_path.exists():
                return FileResponse(
                    path=file_path,
                    filename=filename,
                    media_type='application/zip'
                )
    
    raise HTTPException(status_code=404, detail="Export file not found")
