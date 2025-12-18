from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import and_, delete, select, update
from sqlalchemy.orm import selectinload
from models import IngredientHistory, Ingredient
from schemas.resources import (
    IngredientHistoryRead
)
from utils.format import safe_str_to_datetime
from datetime import datetime, timedelta


class TrackingService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_history_by_period(self, ingredient_id: int, start: str, end: str) -> list[IngredientHistoryRead]:
        if not ingredient_id:
            raise ValueError("ingredient_id is required.")
        if not start or not end:
            raise ValueError("Both start and end dates are required.")
        start_dt = safe_str_to_datetime(start)
        end_dt = safe_str_to_datetime(end)
        if not start_dt or not end_dt:
            raise ValueError("Invalid date format. Use ISO 8601 format.")
        if start_dt >= end_dt:
            raise ValueError("Start date must be earlier than end date.")
        records = await self.db.execute(
            select(IngredientHistory).where(
                and_(
                    IngredientHistory.ingredient_id == ingredient_id,
                    IngredientHistory.created_at >= start_dt,
                    IngredientHistory.created_at < end_dt
                )
            )
        )
        history_list = records.scalars().all()
        return history_list
    
    async def get_usage_stats(self, ingredient_id: int, start: str, end: str):
        start_q = (
            select(IngredientHistory.new_quantity)
            .where(
                IngredientHistory.ingredient_id == ingredient_id,
                IngredientHistory.created_at < start,
            )
            .order_by(IngredientHistory.created_at.desc())
            .limit(1)
            .scalar_subquery()
        )
        end_q = (
            select(IngredientHistory.new_quantity)
            .where(
                IngredientHistory.ingredient_id == ingredient_id,
                IngredientHistory.created_at < end,
            )
            .order_by(IngredientHistory.created_at.desc())
            .limit(1)
            .scalar_subquery()
        )
        query = (
        select(
            Ingredient.id,
            Ingredient.name,
            (end_q - start_q).label("usage"),
        )
        .join(
            Ingredient,
            Ingredient.id == IngredientHistory.ingredient_id,
        )
        .where(Ingredient.id == ingredient_id)  
        )
        row = await self.db.execute(query)
        result = row.one_or_none() 

        return {
            "ingredient_id": result.id,
            "ingredient_name": result.name,
            "usage": result.usage if result.usage is not None else 0,
        }
    


class RestockService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_avg_daily_usage_last_3_days(
        self,
        ingredient_id: int,
        now: datetime | None = None,
    ):
        if now is None:
            now = datetime.utcnow()

        start = now - timedelta(days=3)

        start_q = (
            select(IngredientHistory.new_quantity)
            .where(
                IngredientHistory.ingredient_id == ingredient_id,
                IngredientHistory.created_at < start,
            )
            .order_by(IngredientHistory.created_at.desc())
            .limit(1)
            .scalar_subquery()
        )

        end_q = (
            select(IngredientHistory.new_quantity)
            .where(
                IngredientHistory.ingredient_id == ingredient_id,
                IngredientHistory.created_at < now,
            )
            .order_by(IngredientHistory.created_at.desc())
            .limit(1)
            .scalar_subquery()
        )

        query = select(end_q - start_q)

        result = await self.db.execute(query)
        usage = result.scalar()

        if usage is None or usage <= 0:
            return None

        return usage / 3



    async def get_quantity_info(self):
        now = datetime.utcnow()

        query = select(
            Ingredient.id,
            Ingredient.name,
            Ingredient.quantity,
            Ingredient.threshold,
        )

        result = await self.db.execute(query)
        rows = result.all()

        data = []

        for row in rows:
            avg_daily_usage = await self.get_avg_daily_usage_last_3_days(
                row.id, now
            )

            if avg_daily_usage and avg_daily_usage > 0:
                remaining = row.quantity - row.threshold

                if remaining <= 0:
                    predicted_time = now
                    days_left = 0
                else:
                    days_left = remaining / avg_daily_usage
                    predicted_time = now + timedelta(days=days_left)
            else:
                predicted_time = None
                days_left = None

            data.append({
                "ingredient_id": row.id,
                "ingredient_name": row.name,
                "quantity": row.quantity,
                "threshold": row.threshold,
                "avg_daily_usage": avg_daily_usage,
                "days_left": days_left,
                "predicted_restock_time": predicted_time,
            })

        return data



class NotificationService:
    def __init__(self, db: AsyncSession):
        self.db = db

    #scheduler (table for custom schedule config) - msq queue - consumer -> (noti mail, noti real time - ws, log)
    async def alert_usage(self):
        pass

    async def alert_low_stock(self):
        pass
    
    

