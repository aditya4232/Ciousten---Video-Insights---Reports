import os
import shutil
import json
from pathlib import Path
from app.core.export_engine import _create_yolo_dataset, _create_coco_dataset

def test_export_engine():
    # Setup dummy data
    output_dir = Path("tests/output/export_test")
    if output_dir.exists():
        shutil.rmtree(output_dir)
    output_dir.mkdir(parents=True)
    
    frames_dir = output_dir / "frames"
    frames_dir.mkdir()
    
    # Create dummy frames
    for i in range(5):
        (frames_dir / f"frame_{i:06d}.jpg").touch()
        
    data = {
        "video_metadata": {"width": 1920, "height": 1080},
        "stats": {
            "objects_per_class": {"car": 10, "person": 5}
        },
        "frames": [
            {
                "frame_index": 0,
                "objects": [
                    {"class_name": "car", "bbox": [100, 100, 200, 200]},
                    {"class_name": "person", "bbox": [300, 300, 350, 400]}
                ]
            },
            {
                "frame_index": 1,
                "objects": [
                    {"class_name": "car", "bbox": [110, 100, 210, 200]}
                ]
            }
        ]
    }
    
    # Test YOLO Export
    print("Testing YOLO Export...")
    yolo_dir = output_dir / "yolo"
    yolo_dir.mkdir()
    try:
        _create_yolo_dataset(data, frames_dir, yolo_dir)
        
        # Verify structure
        if not (yolo_dir / "data.yaml").exists():
            print("❌ data.yaml missing")
        elif not (yolo_dir / "images").exists():
            print("❌ images dir missing")
        elif not (yolo_dir / "labels").exists():
            print("❌ labels dir missing")
        else:
            # Verify content
            with open(yolo_dir / "labels" / "frame_000000.txt") as f:
                content = f.read()
                if len(content.strip().split('\n')) == 2:
                    print("✅ YOLO Export successful")
                else:
                    print(f"❌ YOLO label content incorrect: {content}")
    except Exception as e:
        print(f"❌ YOLO Export failed: {e}")

    # Test COCO Export
    print("\nTesting COCO Export...")
    coco_dir = output_dir / "coco"
    coco_dir.mkdir()
    try:
        _create_coco_dataset(data, frames_dir, coco_dir)
        
        # Verify structure
        if not (coco_dir / "annotations.json").exists():
            print("❌ annotations.json missing")
        elif not (coco_dir / "images").exists():
            print("❌ images dir missing")
        else:
            # Verify content
            with open(coco_dir / "annotations.json") as f:
                coco_json = json.load(f)
                if len(coco_json["images"]) == 2 and len(coco_json["annotations"]) == 3:
                    print("✅ COCO Export successful")
                else:
                    print(f"❌ COCO content incorrect: {len(coco_json['images'])} images, {len(coco_json['annotations'])} annotations")
    except Exception as e:
        print(f"❌ COCO Export failed: {e}")

    # Cleanup
    shutil.rmtree(output_dir)

if __name__ == "__main__":
    test_export_engine()
