from typing import List
from fastapi import WebSocket, WebSocketDisconnect
import sys
import json

class WebSocketManager:
    def __init__(self):
        self.active: List[WebSocket] = []

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active.append(ws)
        print(f"[WS_MANAGER] Client connected. Total connections: {len(self.active)}", file=sys.stdout, flush=True)

    def disconnect(self, ws: WebSocket):
        if ws in self.active:
            self.active.remove(ws)
            print(f"[WS_MANAGER] Client disconnected. Total connections: {len(self.active)}", file=sys.stdout, flush=True)

    async def broadcast(self, data: dict):
        print(f"[WS_MANAGER] Broadcasting to {len(self.active)} active connections: {data}", file=sys.stdout, flush=True)
        
        # Convert Pydantic models to dicts for JSON serialization
        serialized_data = {}
        for key, value in data.items():
            if hasattr(value, 'model_dump'):
                serialized_data[key] = value.model_dump()
            else:
                serialized_data[key] = value
        
        for ws in list(self.active):
            try:
                await ws.send_json(serialized_data)
                print(f"[WS_MANAGER] Message sent successfully", file=sys.stdout, flush=True)
            except Exception as e:
                print(f"[WS_MANAGER] Error sending message: {e}", file=sys.stderr, flush=True)
                self.disconnect(ws)


# Global singleton instance
ws_manager = WebSocketManager()