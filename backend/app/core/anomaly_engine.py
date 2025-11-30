"""
Anomaly Detection Engine (Heuristic / Lightweight)
Detects unusual patterns in video segmentation data without heavy GPU models.
"""

from typing import List, Dict, Any
from app.schemas import Anomaly
import numpy as np

def detect_anomalies(segmentation_data: Dict[str, Any]) -> List[Anomaly]:
    """
    Detect anomalies based on simple heuristics:
    1. Sudden spikes in object counts.
    2. Presence of rare classes (if defined).
    3. High velocity (if tracking data available - simplified here to just counts).
    """
    anomalies: List[Anomaly] = []
    
    # Extract frame data
    frames = segmentation_data.get("frames", [])
    if not frames:
        return anomalies

    # 1. Analyze Object Counts per Frame
    counts = []
    for frame in frames:
        count = len(frame.get("objects", []))
        counts.append(count)
    
    if not counts:
        return anomalies

    # Calculate statistics
    mean_count = np.mean(counts)
    std_count = np.std(counts)
    threshold = mean_count + (2.0 * std_count)  # 2 Sigma rule

    # Detect spikes
    for i, count in enumerate(counts):
        if count > threshold and count > 3: # Ignore small noise
            frame = frames[i]
            severity = min(1.0, (count - mean_count) / (3 * std_count + 0.1))
            
            anomalies.append(Anomaly(
                frame_index=frame.get("frame_index", i),
                timestamp=frame.get("timestamp", 0.0),
                description=f"Unusual spike in object count: {count} objects (Avg: {mean_count:.1f})",
                severity=round(severity, 2)
            ))

    return anomalies
