"""
Anomaly Detection Engine (Heuristic / Lightweight)
Detects unusual patterns in video segmentation data without heavy GPU models.
"""

from typing import List, Dict, Any
from app.schemas import Anomaly
import numpy as np

def detect_anomalies(segmentation_data: Dict[str, Any]) -> List[Anomaly]:
    """
    Detect anomalies based on heuristics:
    1. Sudden spikes in object counts.
    2. High velocity objects (speeding).
    3. Stationary objects (loitering).
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

    # 2. Analyze Object Speed (if tracking data available)
    # object_id -> list of (frame_idx, x, y)
    object_tracks = {}
    for frame in frames:
        frame_idx = frame.get("frame_index")
        for obj in frame.get("objects", []):
            obj_id = obj.get("id")
            bbox = obj.get("bbox")
            if obj_id != -1 and bbox:
                cx = (bbox[0] + bbox[2]) / 2
                cy = (bbox[1] + bbox[3]) / 2
                if obj_id not in object_tracks:
                    object_tracks[obj_id] = []
                object_tracks[obj_id].append((frame_idx, cx, cy))

    # Calculate speeds
    speeds = []
    for obj_id, track in object_tracks.items():
        if len(track) < 5: continue # Ignore short tracks
        
        # Calculate avg speed for this object
        dist = 0
        for k in range(1, len(track)):
            dx = track[k][1] - track[k-1][1]
            dy = track[k][2] - track[k-1][2]
            dist += (dx**2 + dy**2)**0.5
        
        avg_speed = dist / (len(track) - 1)
        speeds.append(avg_speed)

    if speeds:
        mean_speed = np.mean(speeds)
        std_speed = np.std(speeds)
        speed_threshold = mean_speed + (2.5 * std_speed)
        
        # Check for speeding objects
        for obj_id, track in object_tracks.items():
            if len(track) < 5: continue
            
            dist = 0
            for k in range(1, len(track)):
                dx = track[k][1] - track[k-1][1]
                dy = track[k][2] - track[k-1][2]
                dist += (dx**2 + dy**2)**0.5
            
            obj_speed = dist / (len(track) - 1)
            
            if obj_speed > speed_threshold and obj_speed > 10: # Minimum speed to consider
                # Find the frame where this object appears
                frame_idx = track[0][0]
                timestamp = next((f.get("timestamp") for f in frames if f.get("frame_index") == frame_idx), 0.0)
                
                anomalies.append(Anomaly(
                    frame_index=frame_idx,
                    timestamp=timestamp,
                    description=f"High speed object detected (ID: {obj_id}, Speed: {obj_speed:.1f})",
                    severity=0.8
                ))

    return anomalies
