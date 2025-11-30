"""
Database models and session management using SQLAlchemy.
"""

from sqlalchemy import Column, String, Integer, Float, DateTime, Text, Boolean, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from datetime import datetime
from app.config import settings
import json

Base = declarative_base()


class Project(Base):
    """Project model representing a video analysis project."""
    __tablename__ = "projects"
    
    id = Column(String, primary_key=True, index=True)
    video_filename = Column(String, nullable=False)
    video_path = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)
    status = Column(String, default="uploaded")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Progress Tracking
    progress = Column(Integer, default=0)
    status_message = Column(String, default="Initialized")
    
    # Segmentation data
    total_frames = Column(Integer, nullable=True)
    total_objects = Column(Integer, nullable=True)
    segmentation_json_path = Column(String, nullable=True)
    segmentation_time = Column(Float, nullable=True)
    annotated_video_path = Column(String, nullable=True)
    
    # Analysis data
    analysis_json = Column(Text, nullable=True)
    analysis_model = Column(String, nullable=True)
    analysis_type = Column(String, nullable=True)
    
    # Reports
    excel_path = Column(String, nullable=True)
    pdf_path = Column(String, nullable=True)
    has_reports = Column(Boolean, default=False)


# Create async engine
engine = create_async_engine(
    settings.database_url,
    echo=False,
    future=True
)

# Create async session factory
AsyncSessionLocal = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)


async def init_db():
    """Initialize database tables."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_db():
    """Dependency for getting database session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
