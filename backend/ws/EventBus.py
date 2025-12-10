from .manager import ws_manager

class EventBus:
    @staticmethod
    async def publish_order_created(order):
        await ws_manager.broadcast({
            "event": "order_created",
            "data": order
        })

    @staticmethod
    async def publish_order_updated(order):
        await ws_manager.broadcast({
            "event": "order_updated",
            "data": order
        })

    @staticmethod
    async def publish_order_completed(order):
        await ws_manager.broadcast({
            "event": "order_completed",
            "data": order
        })
    
    @staticmethod
    async def publish_order_item_created(order_item):
        await ws_manager.broadcast({
            "event": "order_item_created",
            "data": order_item
        })

    @staticmethod
    async def publish_order_item_updated(order_item):
        await ws_manager.broadcast({
            "event": "order_item_updated",
            "data": order_item
        })