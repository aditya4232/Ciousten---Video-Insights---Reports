"""
Activity Recognition Engine (Rule-based / Lightweight)
Derives symbolic activities from segmentation data.
"""

from typing import List, Dict, Any
from app.schemas import Activity
import numpy as np

def detect_activities(segmentation_data: Dict[str, Any]) -> List[Activity]:
    """
    Detect activities based on object counts and density over time windows.
    Activities:
    - "Empty Scene": 0 objects
    - "Light Activity": 1-5 objects
    - "Moderate Activity": 6-15 objects
    - "High Activity / Congestion": > 15 objects
    """
    activities: List[Activity] = []
    frames = segmentation_data.get("frames", [])
    if not frames:
        return activities

    # Parameters
    WINDOW_SIZE = 30  # Frames to smooth over (e.g., 1 second at 30fps)
    
    current_label = None
    start_frame = 0
    
    # Helper to get label for a count
    def get_label(count):
        if count == 0: return "Empty Scene"
        if count <= 5: return "Light Activity"
        if count <= 15: return "Moderate Activity"
        return "High Activity"

    # Process in chunks
    for i in range(0, len(frames), WINDOW_SIZE):
        chunk = frames[i : i + WINDOW_SIZE]
        if not chunk:
            break
            
        # Avg count in this window
        avg_count = np.mean([len(f.get("objects", [])) for f in chunk])
        label = get_label(avg_count)
        
        end_frame = chunk[-1].get("frame_index", i + len(chunk) - 1)
        
        if label != current_label:
            if current_label is not None:
                # Close previous activity
                activities.append(Activity(
                    start_frame=start_frame,
                    end_frame=frames[i-1].get("frame_index", i-1),
                    label=current_label,
                    confidence=0.85 # Heuristic confidence
                ))
            # Start new activity
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
