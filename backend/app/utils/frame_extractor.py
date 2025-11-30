"""
Video frame extraction utilities using OpenCV.
"""

import cv2
from pathlib import Path
from typing import List, Tuple
import numpy as np


def extract_frames(
    video_path: str,
    output_dir: str,
    fps: int = 2,
    max_frames: int = None
) -> Tuple[List[str], dict]:
    """
    Extract frames from video at specified FPS.
    
    Args:
        video_path: Path to input video file
        output_dir: Directory to save extracted frames
        fps: Frames per second to extract (default: 2)
        max_frames: Maximum number of frames to extract (optional)
    
    Returns:
        Tuple of (list of frame paths, video metadata dict)
    """
    # Create output directory
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)
    
    # Open video
    cap = cv2.VideoCapture(video_path)
    
    if not cap.isOpened():
        raise ValueError(f"Could not open video file: {video_path}")
    
    # Get video properties
    video_fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    duration = total_frames / video_fps if video_fps > 0 else 0
    
    metadata = {
        "original_fps": video_fps,
        "total_frames": total_frames,
        "width": width,
        "height": height,
        "duration_seconds": duration
    }
    
    # Calculate frame interval
    frame_interval = int(video_fps / fps) if fps > 0 else 1
    
    frame_paths = []
    frame_count = 0
    extracted_count = 0
    
    while True:
        ret, frame = cap.read()
        
        if not ret:
            break
        
        # Extract frame at specified interval
        if frame_count % frame_interval == 0:
            frame_filename = f"frame_{extracted_count:04d}.jpg"
            frame_path = output_path / frame_filename
            
            # Save frame
            cv2.imwrite(str(frame_path), frame)
            frame_paths.append(str(frame_path))
            
            extracted_count += 1
            
            # Check max frames limit
            if max_frames and extracted_count >= max_frames:
                break
        
        frame_count += 1
    
    cap.release()
    
    metadata["extracted_frames"] = extracted_count
    metadata["extraction_fps"] = fps
    
    return frame_paths, metadata


def load_frame(frame_path: str) -> np.ndarray:
    """
    Load a frame from disk.
    
    Args:
        frame_path: Path to frame image
    
    Returns:
        Frame as numpy array (BGR format)
    """
    frame = cv2.imread(frame_path)
    if frame is None:
        raise ValueError(f"Could not load frame: {frame_path}")
    return frame


def resize_frame(frame: np.ndarray, max_size: int = 1024) -> np.ndarray:
    """
    Resize frame to fit within max_size while maintaining aspect ratio.
    
    Args:
        frame: Input frame
        max_size: Maximum dimension size
    
    Returns:
        Resized frame
    """
    h, w = frame.shape[:2]
    
    if max(h, w) <= max_size:
        return frame
    
    if h > w:
        new_h = max_size
        new_w = int(w * (max_size / h))
    else:
        new_w = max_size
        new_h = int(h * (max_size / w))
    
    return cv2.resize(frame, (new_w, new_h), interpolation=cv2.INTER_AREA)
