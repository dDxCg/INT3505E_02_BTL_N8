from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
import sys

from configs.postgre import get_db
from repository.booking import OrderRepository
from schemas.booking import (
    OrderCreate,
    OrderUpdate,
    OrderRead,
    OrderFilter,
)
from services.booking import OrderService

from ws import EventBus

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("", response_model=OrderRead, status_code=status.HTTP_201_CREATED)
async def create_order(
    payload: OrderCreate,
    db: AsyncSession = Depends(get_db),
):
    """Create a new order at a table."""
    try:
        order_repo = OrderRepository(db)
        data = await order_repo.create_order(payload)
        
        await EventBus.publish_order_created(data)

        return data
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@router.get("", response_model=list[OrderRead])
async def get_orders(
    filters: OrderFilter = Depends(),
    db: AsyncSession = Depends(get_db),
):
    """Get all orders with optional filters."""
    order_repo = OrderRepository(db)
    return await order_repo.get_all_orders(filters)


@router.get("/{order_id}", response_model=OrderRead)
async def get_order(
    order_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Get order by id."""
    order_repo = OrderRepository(db)
    order = await order_repo.get_order_by_id(order_id)
    
    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order {order_id} not found"
        )
    return order


@router.put("/{order_id}", response_model=OrderRead)
async def update_order(
    order_id: int,
    payload: OrderUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Update order status or guest."""
    try:
        order_repo = OrderRepository(db)
        order = await order_repo.update_order(order_id, payload)
        
        if order is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Order {order_id} not found"
            )
        
        await EventBus.publish_order_updated(order)

        return order
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.delete("/{order_id}", response_model=OrderRead | None)
async def delete_order(
    order_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Delete order."""
    order_repo = OrderRepository(db)
    order = await order_repo.delete_order(order_id)
    
    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order {order_id} not found"
        )

    return order


@router.post("/{order_id}/complete", response_model=OrderRead)
async def complete_order(
    order_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Complete an order (set status to COMPLETED and free table)."""
    try:
        order_repo = OrderRepository(db)
        order = await order_repo.complete_order(order_id)
        
        await EventBus.publish_order_completed(order)
        
        return order
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/{order_id}/total")
async def get_total(
    order_id: int,
    db: AsyncSession = Depends(get_db),
):
    order_service = OrderService(db)
    total = await order_service.calculate_total_amount(order_id)
    return total