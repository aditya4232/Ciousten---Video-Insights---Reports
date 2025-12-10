"""
WebSocket Routes for Real-Time Updates
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.websocket_manager import manager

router = APIRouter()


@router.websocket("/ws/{project_id}")
async def websocket_project_endpoint(websocket: WebSocket, project_id: str):
    """
    WebSocket endpoint for project-specific updates.
    Connect to receive real-time updates for a specific project.
    """
    await manager.connect(websocket, project_id)
    try:
        # Send initial connection confirmation
        await manager.send_personal_message({
            "type": "connected",
            "project_id": project_id,
            "message": f"Connected to project {project_id}"
        }, websocket)
        
        # Keep connection alive and handle incoming messages
        while True:
            data = await websocket.receive_text()
            # Echo back for ping/pong
            await manager.send_personal_message({
                "type": "pong",
                "message": "Connection alive"
            }, websocket)
            
    except WebSocketDisconnect:
        manager.disconnect(websocket, project_id)


@router.websocket("/ws/system")
async def websocket_system_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for system-wide updates.
    Connect to receive real-time system health and statistics.
    """
    await manager.connect(websocket)
    try:
        # Send initial connection confirmation
        await manager.send_personal_message({
            "type": "connected",
            "scope": "system",
            "message": "Connected to system updates"
        }, websocket)
        
        # Keep connection alive
        while True:
            data = await websocket.receive_text()
            await manager.send_personal_message({
                "type": "pong",
                "message": "Connection alive"
            }, websocket)
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)
