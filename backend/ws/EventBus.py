from .manager import ws_manager
import sys

class EventBus:
    @staticmethod
    async def publish_order_created(order):
        print(f"[EVENT] Publishing order_created event for order: {order}", file=sys.stdout, flush=True)
        await ws_manager.broadcast({
            "event": "order_created",
            "data": order
        })

    @staticmethod
    async def publish_order_updated(order):
        print(f"[EVENT] Publishing order_updated event for order: {order}", file=sys.stdout, flush=True)
        await ws_manager.broadcast({
            "event": "order_updated",
            "data": order
        })

    @staticmethod
    async def publish_order_completed(order):
        print(f"[EVENT] Publishing order_completed event for order: {order}", file=sys.stdout, flush=True)
        await ws_manager.broadcast({
            "event": "order_completed",
            "data": order
        })
    
    @staticmethod
    async def publish_order_item_created(order_item):
        print(f"[EVENT] Publishing order_item_created event for item: {order_item}", file=sys.stdout, flush=True)
        await ws_manager.broadcast({
            "event": "order_item_created",
            "data": order_item
        })

    @staticmethod
    async def publish_order_item_updated(order_item):
        print(f"[EVENT] Publishing order_item_updated event for item: {order_item}", file=sys.stdout, flush=True)
        await ws_manager.broadcast({
            "event": "order_item_updated",
            "data": order_item
        })