"""
COCO Format Exporter
Export segmentation data to COCO format for dataset creation
"""
import json
from datetime import datetime
from pathlib import Path
from typing import List, Dict
import shutil


class COCOExporter:
    """Export video segmentation data to COCO format"""
    
    def __init__(self, project_id: str, project_dir: Path):
        self.project_id = project_id
        self.project_dir = project_dir
        self.frames_dir = project_dir / "frames"
        self.annotations_file = project_dir / "annotations.json"
    
    def export_to_coco(self, output_dir: Path = None) -> Dict:
        """
        Export project data to COCO format.
        
        Returns:
            Dictionary with COCO format data and export path
        """
        if output_dir is None:
            output_dir = self.project_dir / "coco_export"
        
        output_dir.mkdir(parents=True, exist_ok=True)
        
        # Load annotations
        if not self.annotations_file.exists():
            raise FileNotFoundError("Annotations file not found")
        
        with open(self.annotations_file, 'r') as f:
            annotations_data = json.load(f)
        
        # Build COCO structure
        coco_data = {
            "info": {
                "description": f"Ciousten Video Segmentation - Project {self.project_id}",
                "url": "https://github.com/aditya4232/Ciousten---Video-Insights---Reports",
                "version": "1.2.0",
                "year": datetime.now().year,
                "contributor": "Ciousten",
                "date_created": datetime.now().isoformat()
            },
            "licenses": [{
                "id": 1,
                "name": "MIT License",
                "url": "https://opensource.org/licenses/MIT"
            }],
            "images": [],
            "annotations": [],
            "categories": []
        }
        
        # Build categories from unique classes
        class_names = set()
        for frame_data in annotations_data.get("frames", []):
            for obj in frame_data.get("objects", []):
                class_names.add(obj.get("class", "unknown"))
        
        categories = {}
        for idx, class_name in enumerate(sorted(class_names), start=1):
            categories[class_name] = idx
            coco_data["categories"].append({
                "id": idx,
                "name": class_name,
                "supercategory": "object"
            })
        
        # Build images and annotations
        annotation_id = 1
        for frame_idx, frame_data in enumerate(annotations_data.get("frames", []), start=1):
            frame_path = frame_data.get("frame_path", "")
            
            # Add image entry
            image_entry = {
                "id": frame_idx,
                "file_name": Path(frame_path).name,
                "width": frame_data.get("width", 1920),
                "height": frame_data.get("height", 1080),
                "date_captured": frame_data.get("timestamp", "")
            }
            coco_data["images"].append(image_entry)
            
            # Add annotations for this frame
            for obj in frame_data.get("objects", []):
                bbox = obj.get("bbox", [0, 0, 0, 0])  # [x, y, w, h]
                
                annotation = {
                    "id": annotation_id,
                    "image_id": frame_idx,
                    "category_id": categories.get(obj.get("class", "unknown"), 0),
                    "bbox": bbox,
                    "area": bbox[2] * bbox[3] if len(bbox) == 4 else 0,
                    "iscrowd": 0,
                    "confidence": obj.get("confidence", 1.0)
                }
                
                # Add segmentation if available
                if "segmentation" in obj:
                    annotation["segmentation"] = obj["segmentation"]
                
                coco_data["annotations"].append(annotation)
                annotation_id += 1
        
        # Save COCO JSON
        coco_json_path = output_dir / "annotations.json"
        with open(coco_json_path, 'w') as f:
            json.dump(coco_data, f, indent=2)
        
        # Copy images to export directory
        images_dir = output_dir / "images"
        images_dir.mkdir(exist_ok=True)
        
        if self.frames_dir.exists():
            for frame_file in self.frames_dir.glob("*.jpg"):
                shutil.copy2(frame_file, images_dir / frame_file.name)
        
        return {
            "success": True,
            "export_path": str(output_dir),
            "coco_json": str(coco_json_path),
            "images_count": len(coco_data["images"]),
            "annotations_count": len(coco_data["annotations"]),
            "categories_count": len(coco_data["categories"]),
            "categories": list(categories.keys())
        }
    
    def export_to_yolo(self, output_dir: Path = None) -> Dict:
        """
        Export project data to YOLO format.
        
        Returns:
            Dictionary with YOLO format data and export path
        """
        if output_dir is None:
            output_dir = self.project_dir / "yolo_export"
        
        output_dir.mkdir(parents=True, exist_ok=True)
        
        # Load annotations
        if not self.annotations_file.exists():
            raise FileNotFoundError("Annotations file not found")
        
        with open(self.annotations_file, 'r') as f:
            annotations_data = json.load(f)
        
        # Build class mapping
        class_names = set()
        for frame_data in annotations_data.get("frames", []):
            for obj in frame_data.get("objects", []):
                class_names.add(obj.get("class", "unknown"))
        
        class_list = sorted(class_names)
        class_to_id = {name: idx for idx, name in enumerate(class_list)}
        
        # Save class names
        with open(output_dir / "classes.txt", 'w') as f:
            f.write('\n'.join(class_list))
        
        # Create labels directory
        labels_dir = output_dir / "labels"
        labels_dir.mkdir(exist_ok=True)
        
        # Create images directory
        images_dir = output_dir / "images"
        images_dir.mkdir(exist_ok=True)
        
        # Process each frame
        for frame_data in annotations_data.get("frames", []):
            frame_path = Path(frame_data.get("frame_path", ""))
            frame_name = frame_path.stem
            
            # Copy image
            if self.frames_dir.exists() and (self.frames_dir / frame_path.name).exists():
                shutil.copy2(
                    self.frames_dir / frame_path.name,
                    images_dir / frame_path.name
                )
            
            # Create label file
            label_file = labels_dir / f"{frame_name}.txt"
            
            img_width = frame_data.get("width", 1920)
            img_height = frame_data.get("height", 1080)
            
            with open(label_file, 'w') as f:
                for obj in frame_data.get("objects", []):
                    class_id = class_to_id.get(obj.get("class", "unknown"), 0)
                    bbox = obj.get("bbox", [0, 0, 0, 0])  # [x, y, w, h]
                    
                    # Convert to YOLO format (normalized center x, center y, width, height)
                    if len(bbox) == 4:
                        x_center = (bbox[0] + bbox[2] / 2) / img_width
                        y_center = (bbox[1] + bbox[3] / 2) / img_height
                        width = bbox[2] / img_width
                        height = bbox[3] / img_height
                        
                        f.write(f"{class_id} {x_center:.6f} {y_center:.6f} {width:.6f} {height:.6f}\n")
        
        # Create data.yaml
        data_yaml = f"""# Ciousten YOLO Dataset
# Project: {self.project_id}
# Generated: {datetime.now().isoformat()}

path: {output_dir.absolute()}
train: images
val: images

nc: {len(class_list)}
names: {class_list}
"""
        
        with open(output_dir / "data.yaml", 'w') as f:
            f.write(data_yaml)
        
        return {
            "success": True,
            "export_path": str(output_dir),
            "data_yaml": str(output_dir / "data.yaml"),
            "classes_count": len(class_list),
            "classes": class_list
        }
