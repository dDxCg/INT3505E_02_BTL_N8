from fastapi import APIRouter, Depends, HTTPException, status
from configs.postgre import get_db
from sqlalchemy.ext.asyncio import AsyncSession

from repository.booking import OrderItemRepository
from schemas.booking import OrderItemCreate, OrderItemRead, OrderItemUpdate, OrderItemFilter, OrderItemBase

from ws import EventBus

router = APIRouter(prefix="/orders/items", tags=["OrderItems"])

@router.post("/", response_model=OrderItemBase)
async def create_order_item(
    order_item: OrderItemCreate,
    db: AsyncSession = Depends(get_db),
):
    order_item_repository = OrderItemRepository(db)
    item = await order_item_repository.create_order_item(order_item)

    await EventBus.publish_order_item_created(item)

    return item

@router.get("/", response_model=list[OrderItemRead])
async def get_order_items(
    filter: OrderItemFilter = Depends(),
    db: AsyncSession = Depends(get_db),
):
    order_item_repository = OrderItemRepository(db)
    return await order_item_repository.get_all_order_items(filter)

@router.get("/{order_item_id}", response_model=OrderItemRead)
async def get_order_item_by_id(
    order_item_id: int,
    db: AsyncSession = Depends(get_db),
):
    order_item_repository = OrderItemRepository(db)
    return await order_item_repository.get_order_item_by_id(order_item_id)

@router.put("/{order_item_id}", response_model=OrderItemBase)
async def update_order_item(
    order_item_id: int,
    order_item: OrderItemUpdate,
    db: AsyncSession = Depends(get_db),
):
    order_item_repository = OrderItemRepository(db)
    item = await order_item_repository.update_order_item(order_item_id, order_item)

    await EventBus.publish_order_item_updated(item)

    return item

@router.delete("/{order_item_id}", response_model=OrderItemBase | None)
async def delete_order_item(
    order_item_id: int,
    db: AsyncSession = Depends(get_db),
):
    order_item_repository = OrderItemRepository(db)
    item = await order_item_repository.delete_order_item(order_item_id)

    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order Item {order_item_id} not found"
        )

    return item