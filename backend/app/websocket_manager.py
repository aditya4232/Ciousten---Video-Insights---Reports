"""
WebSocket Manager for Real-Time Progress Updates
Provides live updates for video processing, segmentation, and analysis
"""
from typing import Dict, Set
from fastapi import WebSocket
import json
import asyncio
from datetime import datetime


class ConnectionManager:
    """Manage WebSocket connections for real-time updates"""
    
    def __init__(self):
        # Store active connections by project_id
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        # Store global connections (for system updates)
        self.global_connections: Set[WebSocket] = set()
    
    async def connect(self, websocket: WebSocket, project_id: str = None):
        """Accept a new WebSocket connection"""
        await websocket.accept()
        
        if project_id:
            if project_id not in self.active_connections:
                self.active_connections[project_id] = set()
            self.active_connections[project_id].add(websocket)
        else:
            self.global_connections.add(websocket)
    
    def disconnect(self, websocket: WebSocket, project_id: str = None):
        """Remove a WebSocket connection"""
        if project_id and project_id in self.active_connections:
            self.active_connections[project_id].discard(websocket)
            if not self.active_connections[project_id]:
                del self.active_connections[project_id]
        else:
            self.global_connections.discard(websocket)
    
    async def send_personal_message(self, message: dict, websocket: WebSocket):
        """Send message to a specific connection"""
        try:
            await websocket.send_json(message)
        except Exception as e:
            print(f"Error sending message: {e}")
    
    async def broadcast_to_project(self, project_id: str, message: dict):
        """Broadcast message to all connections watching a project"""
        if project_id in self.active_connections:
            disconnected = set()
            for connection in self.active_connections[project_id]:
                try:
                    await connection.send_json(message)
                except Exception:
                    disconnected.add(connection)
            
            # Clean up disconnected clients
            for connection in disconnected:
                self.active_connections[project_id].discard(connection)
    
    async def broadcast_global(self, message: dict):
        """Broadcast message to all global connections"""
        disconnected = set()
        for connection in self.global_connections:
            try:
                await connection.send_json(message)
            except Exception:
                disconnected.add(connection)
        
        # Clean up disconnected clients
        for connection in disconnected:
            self.global_connections.discard(connection)
    
    async def send_progress_update(
        self, 
        project_id: str, 
        stage: str, 
        progress: int, 
        message: str,
        details: dict = None
    ):
        """Send progress update for a project"""
        update = {
            "type": "progress",
            "project_id": project_id,
            "stage": stage,
            "progress": progress,
            "message": message,
            "timestamp": datetime.utcnow().isoformat(),
            "details": details or {}
        }
        await self.broadcast_to_project(project_id, update)
    
    async def send_completion(
        self, 
        project_id: str, 
        stage: str, 
        success: bool, 
        message: str,
        data: dict = None
    ):
        """Send completion notification"""
        update = {
            "type": "completion",
            "project_id": project_id,
            "stage": stage,
            "success": success,
            "message": message,
            "timestamp": datetime.utcnow().isoformat(),
            "data": data or {}
        }
        await self.broadcast_to_project(project_id, update)
    
    async def send_error(
        self, 
        project_id: str, 
        stage: str, 
        error: str,
        details: dict = None
    ):
        """Send error notification"""
        update = {
            "type": "error",
            "project_id": project_id,
            "stage": stage,
            "error": error,
            "timestamp": datetime.utcnow().isoformat(),
            "details": details or {}
        }
        await self.broadcast_to_project(project_id, update)
    
    async def send_system_update(self, update_type: str, data: dict):
        """Send system-wide update"""
        message = {
            "type": "system",
            "update_type": update_type,
            "timestamp": datetime.utcnow().isoformat(),
            "data": data
        }
        await self.broadcast_global(message)


# Global connection manager instance
manager = ConnectionManager()
