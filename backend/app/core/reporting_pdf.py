"""
PDF report generation using reportlab.
Creates professional multi-page analysis reports.
"""

from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Image
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from typing import Dict, Any, List
from pathlib import Path
from datetime import datetime


def generate_pdf_report(
    project_id: str,
    project_data: Dict[str, Any],
    segmentation_data: Dict[str, Any],
    analysis_data: Dict[str, Any],
    output_path: str
) -> str:
    """
    Generate PDF analysis report.
    
    Args:
        project_id: Project identifier
        project_data: Project metadata
        segmentation_data: Segmentation results
        analysis_data: AI analysis results
        output_path: Path to save PDF file
    
    Returns:
        Path to generated PDF file
    """
    # Create output directory
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    
    # Create PDF document
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        rightMargin=72,
        leftMargin=72,
        topMargin=72,
        bottomMargin=18
    )
    
    # Container for PDF elements
    story = []
    
    # Styles
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#1F4E78'),
        spaceAfter=30,
        alignment=TA_CENTER
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=16,
        textColor=colors.HexColor('#1F4E78'),
        spaceAfter=12,
        spaceBefore=12
    )
    
    # Page 1: Title Page
    story.append(Spacer(1, 2 * inch))
    story.append(Paragraph("Ciousten", title_style))
    story.append(Paragraph("Video Insights & Analysis Report", styles['Heading2']))
    story.append(Spacer(1, 0.5 * inch))
    
    # Project info table
    project_info = [
        ["Project ID:", project_id],
        ["Video File:", project_data.get('video_filename', 'N/A')],
        ["Generated:", datetime.now().strftime("%Y-%m-%d %H:%M:%S")],
        ["", ""],
        ["Created by:", "Aditya Shenvi @2025"],
        ["Website:", "www.adityacuz.dev"]
    ]
    
    info_table = Table(project_info, colWidths=[2 * inch, 4 * inch])
    info_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 11),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    
    story.append(info_table)
    story.append(PageBreak())
    
    # Page 2: Executive Summary
    story.append(Paragraph("Executive Summary", heading_style))
    story.append(Spacer(1, 0.2 * inch))
    
    # Segmentation statistics
    stats = segmentation_data.get('stats', {})
    
    stats_data = [
        ["Metric", "Value"],
        ["Total Frames Analyzed", str(stats.get('total_frames', 0))],
        ["Total Objects Detected", str(stats.get('total_objects', 0))],
        ["Average Objects per Frame", f"{stats.get('avg_objects_per_frame', 0):.2f}"],
        ["Processing Time", f"{stats.get('processing_time_seconds', 0):.1f} seconds"]
    ]
    
    stats_table = Table(stats_data, colWidths=[3 * inch, 2 * inch])
    stats_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E78')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 1, colors.grey)
    ]))
    
    story.append(stats_table)
    story.append(Spacer(1, 0.3 * inch))
    
    # Object class distribution
    story.append(Paragraph("Object Class Distribution", heading_style))
    
    objects_per_class = stats.get('objects_per_class', {})
    class_data = [["Class", "Count", "Percentage"]]
    
    total_objects = stats.get('total_objects', 1)
    for class_name, count in sorted(objects_per_class.items(), key=lambda x: x[1], reverse=True):
        percentage = (count / total_objects * 100) if total_objects > 0 else 0
        class_data.append([class_name, str(count), f"{percentage:.1f}%"])
    
    class_table = Table(class_data, colWidths=[2.5 * inch, 1.5 * inch, 1.5 * inch])
    class_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E78')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 1, colors.grey)
    ]))
    
    story.append(class_table)
    story.append(PageBreak())
    
    # Page 3: AI Analysis
    story.append(Paragraph("AI-Generated Insights", heading_style))
    story.append(Spacer(1, 0.2 * inch))
    
    # Summary
    summary_text = analysis_data.get('summary', 'No analysis available')
    story.append(Paragraph(f"<b>Summary:</b> {summary_text}", styles['BodyText']))
    story.append(Spacer(1, 0.2 * inch))
    
    # Key Findings
    story.append(Paragraph("Key Findings", heading_style))
    findings = analysis_data.get('key_findings', [])
    for finding in findings:
        story.append(Paragraph(f"• {finding}", styles['BodyText']))
        story.append(Spacer(1, 0.1 * inch))
    
    story.append(Spacer(1, 0.2 * inch))
    
    # Anomalies
    anomalies = analysis_data.get('anomalies', [])
    if anomalies:
        story.append(Paragraph("Anomalies Detected", heading_style))
        for anomaly in anomalies:
            story.append(Paragraph(f"• {anomaly}", styles['BodyText']))
            story.append(Spacer(1, 0.1 * inch))
        
        story.append(Spacer(1, 0.2 * inch))
    
    # KPIs
    kpis = analysis_data.get('kpis', [])
    if kpis:
        story.append(Paragraph("Key Performance Indicators", heading_style))
        
        kpi_data = [["Metric", "Value", "Unit"]]
        for kpi in kpis:
            kpi_data.append([
                kpi.get('name', ''),
                f"{kpi.get('value', 0):.2f}",
                kpi.get('unit', '')
            ])
        
        kpi_table = Table(kpi_data, colWidths=[2.5 * inch, 1.5 * inch, 1.5 * inch])
        kpi_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E78')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 1, colors.grey)
        ]))
        
        story.append(kpi_table)
    
    # Dataset Plan
    dataset_plan = analysis_data.get('dataset_plan', {})
    if dataset_plan:
        story.append(PageBreak())
        story.append(Paragraph("Recommended Dataset Plan", heading_style))
        story.append(Spacer(1, 0.2 * inch))
        
        classes = dataset_plan.get('classes', [])
        if classes:
            class_plan_data = [["Class", "Min Samples", "Notes"]]
            for cls in classes:
                class_plan_data.append([
                    cls.get('name', ''),
                    str(cls.get('min_samples', 0)),
                    cls.get('notes', '')
                ])
            
            class_plan_table = Table(class_plan_data, colWidths=[1.5 * inch, 1.5 * inch, 3.5 * inch])
            class_plan_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E78')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 9),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                ('GRID', (0, 0), (-1, -1), 1, colors.grey)
            ]))
            
            story.append(class_plan_table)
    
    # Build PDF
    doc.build(story)
    
    return output_path
