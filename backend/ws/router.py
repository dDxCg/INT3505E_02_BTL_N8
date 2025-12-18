from .manager import ws_manager
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import asyncio
import sys

router = APIRouter()

@router.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws_manager.connect(ws)
    print(f"[WS_ROUTER] WebSocket connected successfully", file=sys.stdout, flush=True)
    try:
        while True:
            # Keep connection alive with a timeout - client can send messages or just stay connected
            try:
                data = await asyncio.wait_for(ws.receive_text(), timeout=30)
                print(f"[WS_ROUTER] Received message: {data}", file=sys.stdout, flush=True)
            except asyncio.TimeoutError:
                # Timeout is fine, just keep the connection open
                print(f"[WS_ROUTER] No message received (timeout), keeping connection alive", file=sys.stdout, flush=True)
                continue
    except WebSocketDisconnect:
        print(f"[WS_ROUTER] WebSocket disconnected", file=sys.stdout, flush=True)
        ws_manager.disconnect(ws)
    except Exception as e:
        print(f"[WS_ROUTER] Error: {e}", file=sys.stderr, flush=True)
        ws_manager.disconnect(ws)