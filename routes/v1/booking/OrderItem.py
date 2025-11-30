from fastapi import APIRouter, Depends
from configs.postgre import get_db
from sqlalchemy.ext.asyncio import AsyncSession

from repository.booking import OrderItemRepository
from schemas.booking import OrderItemCreate, OrderItemRead, OrderItemUpdate, OrderItemFilter, OrderItemBase

router = APIRouter(prefix="/orders/items", tags=["OrderItems"])

@router.post("/", response_model=OrderItemBase)
async def create_order_item(
    order_item: OrderItemCreate,
    db: AsyncSession = Depends(get_db),
):
    order_item_repository = OrderItemRepository(db)
    return await order_item_repository.create_order_item(order_item)

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
    return await order_item_repository.update_order_item(order_item_id, order_item)

@router.delete("/{order_item_id}", response_model=OrderItemBase)
async def delete_order_item(
    order_item_id: int,
    db: AsyncSession = Depends(get_db),
):
    order_item_repository = OrderItemRepository(db)
    return await order_item_repository.delete_order_item(order_item_id)