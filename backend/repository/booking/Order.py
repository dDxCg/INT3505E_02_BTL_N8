from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import and_, delete, select, update
from models import Order, Table, Guest, TableStatus

from schemas.booking import (
    OrderCreate,
    OrderRead,
    OrderUpdate,
    OrderFilter,
)

TABLE_STATUS_AVAILABLE = 1
TABLE_STATUS_SERVING = 2

ORDER_STATUS_COMPLETED = 5

class OrderRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_order(self, data: OrderCreate) -> OrderRead:
        """
        Create a new order at a table.
        Validates table and guest exist (if provided).
        Updates table status to SERVING when order is created.
        """
        # Validate table exists
        table = await self.db.execute(
            select(Table).where(Table.id == data.table_id)
        )
        table_obj = table.scalar_one_or_none()
        if table_obj is None:
            raise ValueError(f"Table with id {data.table_id} does not exist.")
        if table_obj.status_id != TABLE_STATUS_AVAILABLE:
            raise ValueError(f"Table with id {data.table_id} is not available.")

        # Validate guest if provided
        if data.guest_id is not None:
            guest = await self.db.execute(
                select(Guest).where(Guest.id == data.guest_id)
            )
            if guest.scalar_one_or_none() is None:
                raise ValueError(f"Guest with id {data.guest_id} does not exist.")

        # Create order with default status_id = 1 (pending) if not provided
        status_id = data.status_id if data.status_id is not None else 1
        
        order = Order(
            table_id=data.table_id,
            status_id=status_id,
            guest_id=data.guest_id,
        )
        self.db.add(order)
        
        # Update table status to SERVING
        await self.db.execute(
            update(Table).where(Table.id == data.table_id).values(status_id=TABLE_STATUS_SERVING)
        )

        await self.db.commit()
        await self.db.refresh(order)

        return OrderRead.model_validate(order)

    async def get_all_orders(self, filters: OrderFilter) -> list[OrderRead]:
        """Get all orders with optional filters"""
        query = select(Order)
        conditions = []

        if filters.table_id is not None:
            conditions.append(Order.table_id == filters.table_id)
        if filters.status_id is not None:
            conditions.append(Order.status_id == filters.status_id)
        if filters.guest_id is not None:
            conditions.append(Order.guest_id == filters.guest_id)

        if conditions:
            query = query.where(and_(*conditions))

        result = await self.db.execute(query)
        orders = result.scalars().all()

        return [OrderRead.model_validate(order) for order in orders]

    async def get_order_by_id(self, order_id: int) -> OrderRead | None:
        """Get order by id"""
        result = await self.db.execute(
            select(Order).where(Order.id == order_id)
        )
        order = result.scalar_one_or_none()
        
        if order is None:
            return None
        
        return OrderRead.model_validate(order)

    async def update_order(
        self, order_id: int, data: OrderUpdate
    ) -> OrderRead | None:
        """Update order status or guest_id"""
        order = await self.db.execute(
            select(Order).where(Order.id == order_id)
        )
        order = order.scalar_one_or_none()
        if order is None:
            return None

        # Validate guest if provided
        if data.guest_id is not None:
            guest = await self.db.execute(
                select(Guest).where(Guest.id == data.guest_id)
            )
            if guest.scalar_one_or_none() is None:
                raise ValueError(f"Guest with id {data.guest_id} does not exist.")

        update_data = {}
        if data.status_id is not None:
            update_data["status_id"] = data.status_id
        if data.guest_id is not None:
            update_data["guest_id"] = data.guest_id

        if not update_data:
            return OrderRead.model_validate(order)

        await self.db.execute(
            update(Order).where(Order.id == order_id).values(**update_data)
        )
        await self.db.commit()
        await self.db.refresh(order)

        return OrderRead.model_validate(order)

    async def delete_order(self, order_id: int) -> OrderRead | None:
        """Delete order (cascade deletes items)"""
        order = await self.db.execute(
            select(Order).where(Order.id == order_id)
        )
        order = order.scalar_one_or_none()
        if order is None:
            return None

        # Get data before deletion for response
        result = OrderRead.model_validate(order)

        await self.db.execute(delete(Order).where(Order.id == order_id))
        await self.db.commit()

        return result

    async def complete_order(self, order_id: int) -> OrderRead:
        """
        Complete an order: sets order status to COMPLETED (5) 
        and table status back to AVAILABLE (1)
        """
        order = await self.db.execute(
            select(Order).where(Order.id == order_id)
        )
        order = order.scalar_one_or_none()
        
        if order is None:
            raise ValueError(f"Order with id {order_id} does not exist.")
        
        # Update order status to COMPLETED
        await self.db.execute(
            update(Order).where(Order.id == order_id).values(status_id=ORDER_STATUS_COMPLETED)
        )
        
        # Update table status to AVAILABLE
        await self.db.execute(
            update(Table).where(Table.id == order.table_id).values(status_id=TABLE_STATUS_AVAILABLE)
        )
        
        await self.db.commit()
        await self.db.refresh(order)
        
        return OrderRead.model_validate(order)