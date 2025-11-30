import os
import json
import shutil
import zipfile
from pathlib import Path
from typing import Dict, Any
from app.config import settings

def export_dataset(project_id: str, format: str, output_path: str) -> str:
    """
    Export project data as a dataset (COCO or YOLO).
    
    Args:
        project_id: Project identifier
        format: 'coco' or 'yolo'
        output_path: Path to save the zip file
        
    Returns:
        Path to the generated zip file
    """
    # Paths
    frames_dir = Path(settings.data_dir) / "frames" / project_id
    segmentation_json_path = frames_dir / "segmentation_results.json"
    
    if not segmentation_json_path.exists():
        raise FileNotFoundError("Segmentation data not found")
        
    with open(segmentation_json_path, 'r') as f:
        data = json.load(f)
        
    # Create temp directory for dataset construction
    temp_dir = Path(settings.data_dir) / "temp_export" / project_id
    if temp_dir.exists():
        shutil.rmtree(temp_dir)
    temp_dir.mkdir(parents=True)
    
    try:
        if format.lower() == 'yolo':
            _create_yolo_dataset(data, frames_dir, temp_dir)
        elif format.lower() == 'coco':
            _create_coco_dataset(data, frames_dir, temp_dir)
        else:
            raise ValueError(f"Unsupported format: {format}")
            
        # Zip the directory
        shutil.make_archive(str(Path(output_path).with_suffix('')), 'zip', temp_dir)
        
        return str(Path(output_path))
        
    finally:
        # Cleanup temp dir
        if temp_dir.exists():
            shutil.rmtree(temp_dir)

def _create_yolo_dataset(data: Dict[str, Any], frames_dir: Path, output_dir: Path):
    """Create YOLO format dataset."""
    images_dir = output_dir / "images"
    labels_dir = output_dir / "labels"
    images_dir.mkdir()
    labels_dir.mkdir()
    
    # Get class mapping
    classes = sorted(list(data['stats']['objects_per_class'].keys()))
    class_map = {name: i for i, name in enumerate(classes)}
    
    # Create data.yaml
    with open(output_dir / "data.yaml", 'w') as f:
        f.write(f"names:\n")
        for name in classes:
            f.write(f"  - {name}\n")
        f.write(f"nc: {len(classes)}\n")
        f.write(f"train: images\n")
        f.write(f"val: images\n")
        
    # Process frames
    for frame in data['frames']:
        frame_idx = frame['frame_index']
        
        # Copy image
        src_img = frames_dir / f"frame_{frame_idx:06d}.jpg"
        if not src_img.exists():
            continue
            
        dst_img = images_dir / f"frame_{frame_idx:06d}.jpg"
        shutil.copy(src_img, dst_img)
        
        # Create label file
        label_file = labels_dir / f"frame_{frame_idx:06d}.txt"
        
        # Get image dimensions (assuming all same)
        # We can get it from video_metadata if available, or read one image
        # For now, let's assume normalized coordinates are needed, so we need width/height
        # In our segmentation data, bbox is usually [x1, y1, x2, y2] absolute
        # We need to normalize it.
        
        width = data['video_metadata']['width']
        height = data['video_metadata']['height']
        
        with open(label_file, 'w') as f:
            for obj in frame['objects']:
                class_name = obj['class_name']
                if class_name not in class_map:
                    continue
                    
                class_id = class_map[class_name]
                bbox = obj['bbox'] # x1, y1, x2, y2
                
                # Convert to YOLO format: class x_center y_center width height (normalized)
                bw = bbox[2] - bbox[0]
                bh = bbox[3] - bbox[1]
                bx = bbox[0] + bw / 2
                by = bbox[1] + bh / 2
                
                # Normalize
                bx /= width
                by /= height
                bw /= width
                bh /= height
                
                f.write(f"{class_id} {bx:.6f} {by:.6f} {bw:.6f} {bh:.6f}\n")

def _create_coco_dataset(data: Dict[str, Any], frames_dir: Path, output_dir: Path):
    """Create COCO format dataset."""
    images_dir = output_dir / "images"
    images_dir.mkdir()
    
    coco_data = {
        "info": {
            "description": "Ciousten Exported Dataset",
            "year": 2025,
            "version": "1.0"
        },
        "licenses": [],
        "images": [],
        "annotations": [],
        "categories": []
    }
    
    # Categories
    classes = sorted(list(data['stats']['objects_per_class'].keys()))
    class_map = {name: i+1 for i, name in enumerate(classes)} # COCO starts at 1 usually
    
    for name, id in class_map.items():
        coco_data["categories"].append({
            "id": id,
            "name": name,
            "supercategory": "object"
        })
        
    annotation_id = 1
    
    for frame in data['frames']:
        frame_idx = frame['frame_index']
        file_name = f"frame_{frame_idx:06d}.jpg"
        
        # Copy image
        src_img = frames_dir / file_name
        if not src_img.exists():
            continue
            
        shutil.copy(src_img, images_dir / file_name)
        
        # Add image info
        image_id = frame_idx + 1
        coco_data["images"].append({
            "id": image_id,
            "width": data['video_metadata']['width'],
            "height": data['video_metadata']['height'],
            "file_name": file_name
        })
        
        # Add annotations
        for obj in frame['objects']:
            class_name = obj['class_name']
            if class_name not in class_map:
                continue
                
            bbox = obj['bbox'] # x1, y1, x2, y2
            width = bbox[2] - bbox[0]
            height = bbox[3] - bbox[1]
            
            coco_data["annotations"].append({
                "id": annotation_id,
                "image_id": image_id,
                "category_id": class_map[class_name],
                "bbox": [bbox[0], bbox[1], width, height], # COCO is [x, y, width, height]
                "area": width * height,
                "iscrowd": 0
            })
            annotation_id += 1
            
    with open(output_dir / "annotations.json", 'w') as f:
        json.dump(coco_data, f)
