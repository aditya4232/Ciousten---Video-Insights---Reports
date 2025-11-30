"""
YOLO detection engine wrapper using Ultralytics and Supervision.
"""

from ultralytics import YOLO
import supervision as sv
import numpy as np
from typing import List, Dict, Any
from app.config import settings


class YOLOEngine:
    """Wrapper for YOLO object detection with ByteTrack."""
    
    def __init__(self):
        self.model = None
        self.tracker = None
        self.model_loaded = False
    
    def load_model(self):
        """Load YOLO model and initialize tracker."""
        if self.model_loaded:
            return
        
        try:
            # Load YOLOv8 model
            self.model = YOLO(settings.yolo_model)
            # Initialize ByteTrack
            self.tracker = sv.ByteTrack()
            self.model_loaded = True
            print(f"✓ YOLO model loaded: {settings.yolo_model}")
        except Exception as e:
            raise RuntimeError(f"Failed to load YOLO model: {e}")
    
    def detect_and_track(
        self,
        image: np.ndarray,
        confidence: float = None
    ) -> sv.Detections:
        """
        Detect and track objects in an image.
        
        Args:
            image: Input image (BGR format)
            confidence: Confidence threshold
        
        Returns:
            supervision.Detections object with tracker_id
        """
        if not self.model_loaded:
            self.load_model()
        
        conf = confidence if confidence is not None else settings.yolo_confidence
        
        # Run inference
        results = self.model(image, conf=conf, verbose=False)[0]
        
        # Convert to supervision Detections
        detections = sv.Detections.from_ultralytics(results)
        
        # Update tracker
        detections = self.tracker.update_with_detections(detections)
        
        return detections

# Global instance
yolo_engine = YOLOEngine()
