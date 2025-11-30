import os
from pathlib import Path
from app.core.reporting_excel import generate_excel_report
from app.core.reporting_pdf import generate_pdf_report

def test_report_generation():
    # Dummy data
    project_id = "test_project_123"
    project_data = {
        "video_filename": "test_video.mp4",
        "created_at": "2025-01-01T12:00:00"
    }
    segmentation_data = {
        "stats": {
            "total_frames": 100,
            "total_objects": 500,
            "unique_objects": 10,
            "avg_objects_per_frame": 5.0,
            "processing_time_seconds": 10.5,
            "objects_per_class": {"car": 300, "person": 200}
        },
        "frames": [
            {
                "frame_index": 0,
                "timestamp": 0.0,
                "objects": [
                    {"id": 1, "class_name": "car", "confidence": 0.95, "bbox": [10, 10, 50, 50]}
                ]
            }
        ]
    }
    analysis_data = {
        "summary": "This is a test summary.",
        "key_findings": ["Finding 1", "Finding 2"],
        "anomalies": ["Anomaly 1"],
        "kpis": [{"name": "Traffic Flow", "value": 10, "unit": "cars/min"}]
    }
    
    output_dir = Path("tests/output")
    output_dir.mkdir(exist_ok=True)
    
    # Test Excel
    excel_path = output_dir / "test_report.xlsx"
    try:
        generate_excel_report(project_id, project_data, segmentation_data, analysis_data, str(excel_path))
        print("✅ Excel report generated successfully")
        if excel_path.exists():
            print(f"   File created at {excel_path}")
    except Exception as e:
        print(f"❌ Excel report generation failed: {e}")
        
    # Test PDF
    pdf_path = output_dir / "test_report.pdf"
    try:
        generate_pdf_report(project_id, project_data, segmentation_data, analysis_data, str(pdf_path))
        print("✅ PDF report generated successfully")
        if pdf_path.exists():
            print(f"   File created at {pdf_path}")
    except Exception as e:
        print(f"❌ PDF report generation failed: {e}")

if __name__ == "__main__":
    test_report_generation()
