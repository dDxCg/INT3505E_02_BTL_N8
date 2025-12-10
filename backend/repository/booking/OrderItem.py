from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import and_, delete, select, update
from sqlalchemy.orm import selectinload
from models import OrderItem
from schemas.booking import (
    OrderItemCreate,
    OrderItemRead,
    OrderItemUpdate,
    OrderItemFilter,
    OrderItemBase
)

class OrderItemRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_order_item(self, data: OrderItemCreate) -> OrderItemBase:
        order_item = OrderItem(**data.model_dump())
        self.db.add(order_item)
        await self.db.commit()
        await self.db.refresh(order_item)
        return OrderItemBase.model_validate(order_item)

    async def get_order_item_by_id(self, order_item_id: int) -> OrderItemRead | None:
        result = await self.db.execute(
            select(OrderItem)
            .options(
                selectinload(OrderItem.dish),
                selectinload(OrderItem.status)
            )
            .where(OrderItem.id == order_item_id)  
        )
        order_item = result.scalar_one_or_none()

        if order_item is None:
            return None
        
        return OrderItemRead.model_validate(order_item)
    
    async def get_all_order_items(self, filters: OrderItemFilter) -> list[OrderItemRead]:
        query = select(OrderItem).options(
            selectinload(OrderItem.dish),
            selectinload(OrderItem.status)
        )
        conditions = []

        if filters.order_id is not None:
            conditions.append(OrderItem.order_id == filters.order_id)
        if filters.dish_id is not None:
            conditions.append(OrderItem.dish_id == filters.dish_id)
        if filters.quantity is not None:
            conditions.append(OrderItem.quantity == filters.quantity)
        if filters.status_id is not None:
            conditions.append(OrderItem.status_id == filters.status_id)

        if conditions:
            query = query.where(and_(*conditions))

        result = await self.db.execute(query)
        order_items = result.scalars().all()
        return [OrderItemRead.model_validate(item) for item in order_items]
    
    async def update_order_item(self, order_item_id: int, data: OrderItemUpdate) -> OrderItemBase | None:
        result = await self.db.execute(
            select(OrderItem).where(OrderItem.id == order_item_id)
        )
        order_item = result.scalar_one_or_none()

        if order_item is None:
            return None

        update_data = {k: v for k, v in data.model_dump().items() if v is not None}
        if not update_data:
            return order_item

        await self.db.execute(
            update(OrderItem)
            .where(OrderItem.id == order_item_id)
            .values(**update_data)
        )
        await self.db.commit()

        await self.db.refresh(order_item)
        return OrderItemBase.model_validate(order_item)
    
    async def delete_order_item(self, order_item_id: int) -> OrderItemBase | None:
        result = await self.db.execute(
            select(OrderItem).where(OrderItem.id == order_item_id)
        )
        order_item = result.scalar_one_or_none()

        if order_item is None:
            return None

        await self.db.execute(
            delete(OrderItem).where(OrderItem.id == order_item_id)
        )
        await self.db.commit()
        return OrderItemBase.model_validate(order_item)
    
    async def get_order_items_by_order_id(self, order_id: int) -> list[OrderItemRead]:
        result = await self.db.execute(
        select(OrderItem)
        .options(
            selectinload(OrderItem.dish),
            selectinload(OrderItem.status)
        )
        .filter(OrderItem.order_id == order_id)
        )

        order_items = result.scalars().all()
        return [OrderItemRead.model_validate(item) for item in order_items]