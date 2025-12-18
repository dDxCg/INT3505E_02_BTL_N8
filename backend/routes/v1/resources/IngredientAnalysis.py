from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from configs.postgre import get_db

from services.resources import TrackingService, RestockService

router = APIRouter(prefix="/resources/ingredient-analyses", tags=["Ingredients"])

@router.get("/usage/{ingredient_id}")
async def track_ingredient_usage(
    ingredient_id: int,
    start_date: str,
    end_date: str,
    db: AsyncSession = Depends(get_db),
):
    tracking_service = TrackingService(db)
    return await tracking_service.get_history_by_period(ingredient_id, start_date, end_date)

@router.get("/restock")
async def suggest_restock_quantity(
    db: AsyncSession = Depends(get_db),
):
    restock_service = RestockService(db)
    return await restock_service.get_quantity_info()