"""
Configuration management for Ciousten backend.
Uses pydantic-settings for environment variable management.
"""

from pydantic_settings import BaseSettings
from pathlib import Path


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # OpenRouter API
    openrouter_api_key: str
    openrouter_default_model: str = "meta-llama/llama-3.2-11b-vision-instruct:free"
    openrouter_site_url: str = "https://ciousten.adityacuz.dev"
    openrouter_app_name: str = "Ciousten"
    
    # SAM2 Configuration
    sam2_checkpoint: str = "sam2_hiera_tiny.pt"
    sam2_model_cfg: str = "sam2_hiera_t.yaml"
    sam2_device: str = "cpu"
    
    # YOLO Configuration
    yolo_model: str = "yolov8n.pt"
    yolo_confidence: float = 0.25
    
    # Video Processing
    frame_extraction_fps: int = 2
    max_video_size_mb: int = 500
    
    # Database
    database_url: str = "sqlite+aiosqlite:///./ciousten.db"
    
    # Paths
    data_dir: str = "./data"
    reports_dir: str = "./reports"
    sam_models_dir: str = "./sam_models"
    
    class Config:
        env_file = ".env"
        case_sensitive = False


# Global settings instance
settings = Settings()

# Ensure directories exist
Path(settings.data_dir).mkdir(parents=True, exist_ok=True)
Path(settings.reports_dir).mkdir(parents=True, exist_ok=True)
Path(f"{settings.reports_dir}/excel").mkdir(parents=True, exist_ok=True)
Path(f"{settings.reports_dir}/pdf").mkdir(parents=True, exist_ok=True)
Path(settings.sam_models_dir).mkdir(parents=True, exist_ok=True)
