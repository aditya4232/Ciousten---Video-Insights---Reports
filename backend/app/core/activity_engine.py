"""
Activity Recognition Engine (Rule-based / Lightweight)
Derives symbolic activities from segmentation data.
"""

from typing import List, Dict, Any
from app.schemas import Activity
import numpy as np

def detect_activities(segmentation_data: Dict[str, Any]) -> List[Activity]:
    """
    Detect activities based on object counts, density, and movement patterns.
    Uses tracking data to identify flow direction and speed.
    """
    activities: List[Activity] = []
    frames = segmentation_data.get("frames", [])
    if not frames:
        return activities

    # Parameters
    WINDOW_SIZE = 30  # Frames to smooth over
    
    # Track object positions to calculate movement
    # object_id -> list of (frame_idx, x_center, y_center)
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

    # Calculate global movement trends per window
    current_label = None
    start_frame = 0
    
    def get_movement_label(chunk_frames):
        # 1. Count based label
        avg_count = np.mean([len(f.get("objects", [])) for f in chunk_frames])
        base_label = "Empty Scene"
        if avg_count > 15: base_label = "High Activity"
        elif avg_count > 5: base_label = "Moderate Activity"
        elif avg_count > 0: base_label = "Light Activity"
        
        if base_label == "Empty Scene":
            return base_label

        # 2. Movement based label (if tracking data exists)
        # Calculate average displacement of objects in this window
        start_idx = chunk_frames[0].get("frame_index")
        end_idx = chunk_frames[-1].get("frame_index")
        
        total_dx = 0
        total_dy = 0
        active_objects = 0
        
        for obj_id, track in object_tracks.items():
            # Get points within this window
            window_points = [p for p in track if start_idx <= p[0] <= end_idx]
            if len(window_points) >= 2:
                dx = window_points[-1][1] - window_points[0][1]
                dy = window_points[-1][2] - window_points[0][2]
                total_dx += dx
                total_dy += dy
                active_objects += 1
        
        if active_objects > 0:
            avg_dx = total_dx / active_objects
            avg_dy = total_dy / active_objects
            
            # Determine dominant direction
            if abs(avg_dx) > abs(avg_dy):
                direction = "Moving Right" if avg_dx > 0 else "Moving Left"
            else:
                direction = "Moving Down" if avg_dy > 0 else "Moving Up"
            
            # Check if movement is significant
            speed = (avg_dx**2 + avg_dy**2)**0.5
            if speed < 10: # Threshold for stationary/loitering
                return f"{base_label} (Stationary)"
            else:
                return f"{base_label} ({direction})"
        
        return base_label

    # Process in chunks
    for i in range(0, len(frames), WINDOW_SIZE):
        chunk = frames[i : i + WINDOW_SIZE]
        if not chunk:
            break
            
        label = get_movement_label(chunk)
        
        end_frame = chunk[-1].get("frame_index", i + len(chunk) - 1)
        
        if label != current_label:
            if current_label is not None:
                activities.append(Activity(
                    start_frame=start_frame,
                    end_frame=frames[i-1].get("frame_index", i-1),
                    label=current_label,
                    confidence=0.85
                ))
            current_label = label
            start_frame = chunk[0].get("frame_index", i)
            
    # Close last activity
    if current_label is not None:
        activities.append(Activity(
            start_frame=start_frame,
            end_frame=frames[-1].get("frame_index", len(frames)-1),
            label=current_label,
            confidence=0.85
        ))

    return activities
