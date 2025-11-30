from sqlalchemy.ext.asyncio import AsyncSession
from decimal import Decimal
from repository.booking import OrderItemRepository


class OrderService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = OrderItemRepository(db)

    async def calculate_total_amount(self, order_id: int) -> Decimal:
        order_items = await self.repo.get_order_items_by_order_id(order_id)

        if not order_items:
            return Decimal("0.00")

        total = sum(item.dish.price * item.quantity for item in order_items)
        return total