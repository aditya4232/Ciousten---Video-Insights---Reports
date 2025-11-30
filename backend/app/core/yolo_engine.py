"""
YOLO detection engine wrapper using Ultralytics.
CPU-optimized for lightweight object detection.
"""

from ultralytics import YOLO
from typing import List, Dict, Any
import numpy as np
from app.config import settings


class YOLOEngine:
    """Wrapper for YOLO object detection."""
    
    def __init__(self):
        self.model = None
        self.model_loaded = False
    
    def load_model(self):
        """Load YOLO model (downloads automatically if not present)."""
        if self.model_loaded:
            return
        
        try:
            # Load YOLOv8 nano model (smallest, fastest)
            self.model = YOLO(settings.yolo_model)
            self.model_loaded = True
            print(f"✓ YOLO model loaded: {settings.yolo_model}")
        except Exception as e:
            raise RuntimeError(f"Failed to load YOLO model: {e}")
    
    def detect_objects(
        self,
        image: np.ndarray,
        confidence: float = None
    ) -> List[Dict[str, Any]]:
        """
        Detect objects in an image.
        
        Args:
            image: Input image (BGR format from OpenCV)
            confidence: Confidence threshold (uses config default if None)
        
        Returns:
            List of detections with format:
            [
                {
                    'class_id': int,
                    'class_name': str,
                    'bbox': [x1, y1, x2, y2],
                    'confidence': float
                },
                ...
            ]
        """
        if not self.model_loaded:
            self.load_model()
        
        conf = confidence if confidence is not None else settings.yolo_confidence
        
        # Run inference
        results = self.model(image, conf=conf, verbose=False)
        
        detections = []
        
        # Parse results
        for result in results:
            boxes = result.boxes
            
            for i in range(len(boxes)):
                box = boxes[i]
                
                # Get box coordinates (xyxy format)
                x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                
                # Get class and confidence
                class_id = int(box.cls[0].cpu().numpy())
                confidence = float(box.conf[0].cpu().numpy())
                class_name = self.model.names[class_id]
                
                detections.append({
                    'class_id': class_id,
                    'class_name': class_name,
                    'bbox': [float(x1), float(y1), float(x2), float(y2)],
                    'confidence': confidence
                })
        
        return detections


# Global instance
yolo_engine = YOLOEngine()
