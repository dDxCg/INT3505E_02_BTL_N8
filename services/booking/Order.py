from sqlalchemy.ext.asyncio import AsyncSession
from decimal import Decimal
from repository.booking.Order import OrderRepository


class OrderService:
    def __init__(self, db: AsyncSession):
        self.repo = OrderRepository(db)

    async def calculate_total_amount(self, order_id: int) -> Decimal:
        pass