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

class DatasetPlan(BaseModel):
    """Plan for creating a dataset."""
    recommended_classes: List[str]
    train_split: float
    val_split: float
    test_split: float
    notes: str


class KPI(BaseModel):
    """Key Performance Indicator."""
    name: str
    value: float
    unit: str


class Anomaly(BaseModel):
    """Detected anomaly in video."""
    frame_index: int
    timestamp: float
    description: str
    severity: float = Field(..., description="0.0 to 1.0")


class Activity(BaseModel):
    """Detected activity in video segment."""
    start_frame: int
    end_frame: int
    label: str
    confidence: float


class DatasetCard(BaseModel):
    """Auto-generated dataset card."""
    title: str
    description: str
    intended_use: str
    labels: List[str]
    collection_process: str
    risks: str
    limitations: str
    ethical_considerations: str


class PluginStatus(BaseModel):
    """Status of a plugin."""
    name: str
    enabled: bool
    version: str


class PluginResult(BaseModel):
    """Result from a plugin execution."""
    plugin_name: str
    data: Dict[str, Any]


class AnalysisRequest(BaseModel):
    """Request for AI analysis."""
    analysis_type: AnalysisType = AnalysisType.GENERIC
    model: str = "deepseek/deepseek-chat-free"
    mode: str = "generic"  # traffic, retail, security, generic


class AnalysisResult(BaseModel):
    """AI analysis result."""
    summary: str
    key_findings: List[str]
    anomalies: List[str]  # Text summary of anomalies
    anomaly_events: List[Anomaly] = [] # Structured anomalies
    activities: List[Activity] = []
    dataset_plan: DatasetPlan
    kpis: List[KPI]
    mode: str = "generic"


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
