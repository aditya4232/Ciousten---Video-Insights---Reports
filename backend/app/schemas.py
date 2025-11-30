"""
Pydantic schemas for API request/response validation.
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum


class ProjectStatus(str, Enum):
    """Project processing status."""
    UPLOADED = "uploaded"
    SEGMENTING = "segmenting"
    SEGMENTED = "segmented"
    ANALYZING = "analyzing"
    ANALYZED = "analyzed"
    COMPLETED = "completed"
    FAILED = "failed"


class AnalysisType(str, Enum):
    """Type of video analysis."""
    TRAFFIC = "traffic"
    RETAIL = "retail"
    SPORTS = "sports"
    GENERIC = "generic"
    SECURITY = "security"


class VideoUploadResponse(BaseModel):
    """Response after video upload."""
    project_id: str
    filename: str
    file_size: int
    status: ProjectStatus
    message: str


class ObjectDetection(BaseModel):
    """Single object detection in a frame."""
    id: int
    class_name: str
    bbox: List[float] = Field(..., description="[x1, y1, x2, y2]")
    confidence: float
    mask_path: Optional[str] = None


class FrameData(BaseModel):
    """Data for a single frame."""
    frame_index: int
    timestamp: float
    objects: List[ObjectDetection]


class SegmentationStats(BaseModel):
    """Statistics from segmentation process."""
    total_frames: int
    total_objects: int
    objects_per_class: Dict[str, int]
    avg_objects_per_frame: float
    processing_time_seconds: float


class SegmentationResponse(BaseModel):
    """Response after segmentation."""
    project_id: str
    status: ProjectStatus
    stats: SegmentationStats
    message: str


class AnalysisRequest(BaseModel):
    """Request for AI analysis."""
    analysis_type: AnalysisType = AnalysisType.GENERIC
    model: str = "deepseek/deepseek-chat-free"


class DatasetClassPlan(BaseModel):
    """Recommended class for dataset."""
    name: str
    min_samples: int
    notes: str


class DatasetPlan(BaseModel):
    """Recommended dataset plan."""
    classes: List[DatasetClassPlan]
    recommended_split: Dict[str, float] = Field(
        ..., description="train/val/test split percentages"
    )


class KPI(BaseModel):
    """Key Performance Indicator."""
    name: str
    value: float
    unit: str


class AnalysisResult(BaseModel):
    """AI analysis result."""
    summary: str
    key_findings: List[str]
    anomalies: List[str]
    dataset_plan: DatasetPlan
    kpis: List[KPI]


class AnalysisResponse(BaseModel):
    """Response after AI analysis."""
    project_id: str
    status: ProjectStatus
    analysis: AnalysisResult
    model_used: str
    message: str


class ReportGenerationResponse(BaseModel):
    """Response after report generation."""
    project_id: str
    excel_path: str
    pdf_path: str
    message: str


class ProjectSummary(BaseModel):
    """Summary of a project."""
    project_id: str
    video_filename: str
    status: ProjectStatus
    created_at: datetime
    has_segmentation: bool
    has_analysis: bool
    has_reports: bool
    excel_path: Optional[str] = None
    pdf_path: Optional[str] = None
