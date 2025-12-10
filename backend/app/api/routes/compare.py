"""
Video Comparison
Compare multiple videos side-by-side with AI analysis
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from pathlib import Path
from app.config import settings
import json

router = APIRouter()


class ComparisonRequest(BaseModel):
    project_ids: List[str]
    comparison_type: str = "objects"  # objects, activities, anomalies, all
    ai_insights: bool = True


class ComparisonResult(BaseModel):
    comparison_id: str
    projects: List[Dict[str, Any]]
    metrics: Dict[str, Any]
    insights: List[str]
    recommendations: List[str]


@router.post("/compare")
async def compare_videos(request: ComparisonRequest):
    """
    Compare multiple videos
    
    Comparison types:
    - objects: Compare detected objects
    - activities: Compare activities and events
    - anomalies: Compare anomalies detected
    - all: Comprehensive comparison
    """
    if len(request.project_ids) < 2:
        raise HTTPException(
            status_code=400,
            detail="At least 2 projects required for comparison"
        )
    
    if len(request.project_ids) > 5:
        raise HTTPException(
            status_code=400,
            detail="Maximum 5 projects allowed for comparison"
        )
    
    # Load project data
    projects_data = []
    for project_id in request.project_ids:
        project_dir = Path(settings.data_dir) / project_id
        if not project_dir.exists():
            raise HTTPException(
                status_code=404,
                detail=f"Project {project_id} not found"
            )
        
        # Load annotations
        annotations_file = project_dir / "annotations.json"
        if annotations_file.exists():
            with open(annotations_file, 'r') as f:
                annotations = json.load(f)
                projects_data.append({
                    "project_id": project_id,
                    "annotations": annotations
                })
    
    # Perform comparison
    comparison_result = perform_comparison(projects_data, request.comparison_type)
    
    # Generate AI insights if requested
    if request.ai_insights:
        insights = generate_comparison_insights(comparison_result)
        comparison_result["insights"] = insights
    
    return comparison_result


def perform_comparison(projects_data: List[Dict], comparison_type: str) -> Dict:
    """Perform video comparison analysis"""
    
    metrics = {
        "total_projects": len(projects_data),
        "comparison_type": comparison_type
    }
    
    if comparison_type in ["objects", "all"]:
        # Compare object counts
        object_counts = {}
        for project in projects_data:
            project_id = project["project_id"]
            annotations = project.get("annotations", {})
            
            # Count objects per class
            class_counts = {}
            for frame in annotations.get("frames", []):
                for obj in frame.get("objects", []):
                    class_name = obj.get("class", "unknown")
                    class_counts[class_name] = class_counts.get(class_name, 0) + 1
            
            object_counts[project_id] = class_counts
        
        metrics["object_comparison"] = object_counts
        
        # Find common and unique objects
        all_classes = set()
        for counts in object_counts.values():
            all_classes.update(counts.keys())
        
        common_classes = set(all_classes)
        for counts in object_counts.values():
            common_classes &= set(counts.keys())
        
        metrics["common_objects"] = list(common_classes)
        metrics["total_unique_objects"] = len(all_classes)
    
    if comparison_type in ["activities", "all"]:
        # Compare activities (placeholder for actual implementation)
        metrics["activities_comparison"] = {
            "note": "Activity comparison requires AI analysis results"
        }
    
    if comparison_type in ["anomalies", "all"]:
        # Compare anomalies (placeholder)
        metrics["anomalies_comparison"] = {
            "note": "Anomaly comparison requires AI analysis results"
        }
    
    return {
        "comparison_id": f"comp_{len(projects_data)}_{comparison_type}",
        "projects": [p["project_id"] for p in projects_data],
        "metrics": metrics,
        "insights": [],
        "recommendations": []
    }


def generate_comparison_insights(comparison_result: Dict) -> List[str]:
    """Generate AI insights from comparison"""
    insights = []
    
    metrics = comparison_result.get("metrics", {})
    
    # Object comparison insights
    if "object_comparison" in metrics:
        object_counts = metrics["object_comparison"]
        
        # Find project with most objects
        max_objects = max(
            [(pid, sum(counts.values())) for pid, counts in object_counts.items()],
            key=lambda x: x[1],
            default=(None, 0)
        )
        
        if max_objects[0]:
            insights.append(
                f"Project {max_objects[0]} has the most detected objects ({max_objects[1]} total)"
            )
        
        # Common objects insight
        common = metrics.get("common_objects", [])
        if common:
            insights.append(
                f"All videos share {len(common)} common object types: {', '.join(common[:3])}"
            )
    
    # Add general insights
    insights.append(
        f"Comparison includes {metrics.get('total_projects', 0)} videos"
    )
    
    return insights


@router.get("/compare/{comparison_id}")
async def get_comparison_result(comparison_id: str):
    """Get comparison result by ID"""
    # In production, store comparison results in database
    return {
        "message": "Comparison results are generated on-demand",
        "note": "Use POST /api/compare to generate new comparison"
    }


@router.get("/compare/templates")
async def get_comparison_templates():
    """Get pre-defined comparison templates"""
    return {
        "templates": [
            {
                "name": "Object Detection Comparison",
                "type": "objects",
                "description": "Compare detected objects across videos",
                "metrics": ["object_counts", "common_objects", "unique_objects"]
            },
            {
                "name": "Activity Analysis Comparison",
                "type": "activities",
                "description": "Compare activities and events",
                "metrics": ["activity_types", "duration", "frequency"]
            },
            {
                "name": "Anomaly Detection Comparison",
                "type": "anomalies",
                "description": "Compare anomalies detected",
                "metrics": ["anomaly_count", "severity", "types"]
            },
            {
                "name": "Comprehensive Comparison",
                "type": "all",
                "description": "Complete analysis of all aspects",
                "metrics": ["all_metrics"]
            }
        ]
    }
