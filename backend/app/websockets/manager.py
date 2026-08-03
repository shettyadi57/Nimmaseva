from fastapi import WebSocket
from typing import List, Dict

class ConnectionManager:
    def __init__(self):
        # Maps office_id -> List[WebSocket]
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, office_id: int):
        await websocket.accept()
        if office_id not in self.active_connections:
            self.active_connections[office_id] = []
        self.active_connections[office_id].append(websocket)

    def disconnect(self, websocket: WebSocket, office_id: int):
        if office_id in self.active_connections:
            if websocket in self.active_connections[office_id]:
                self.active_connections[office_id].remove(websocket)

    async def broadcast_queue_update(self, office_id: int, data: dict):
        if office_id in self.active_connections:
            for connection in self.active_connections[office_id]:
                try:
                    await connection.send_json(data)
                except Exception:
                    pass

manager = ConnectionManager()
