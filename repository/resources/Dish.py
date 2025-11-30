from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import and_, delete, select, update
from models import Dish
from schemas.resources import (
    DishCreate,
    DishFilter,
    DishUpdate,
)

class DishRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_dish(self, data: DishCreate) -> Dish:
        dish = Dish(**data.model_dump())  
        self.db.add(dish)
        await self.db.commit()
        await self.db.refresh(dish)  
        return dish

    async def get_all_dishes(self, filters: DishFilter) -> list[Dish]:
        query = select(Dish)
        conditions = []

        if filters.name is not None:
            conditions.append(Dish.name.ilike(f"%{filters.name}%"))
        if filters.price is not None:
            conditions.append(Dish.price == filters.price)
        if filters.description is not None:
            conditions.append(Dish.description.ilike(f"%{filters.description}%"))

        if conditions:
            query = query.where(and_(*conditions))

        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def get_dish_by_id(self, dish_id: int) -> Dish | None:
        result = await self.db.execute(select(Dish).where(Dish.id == dish_id))
        return result.scalar_one_or_none()
    
    async def update_dish(self, dish_id: int, data: DishUpdate) -> Dish | None:
        dish = await self.get_dish_by_id(dish_id)
        if dish is None:
            return None
        
        update_data = {k: v for k, v in data.model_dump().items() if v is not None}
        if not update_data:
            return dish
        
        await self.db.execute(
            update(Dish)
            .where(Dish.id == dish_id)
            .values(**update_data)
        )
        await self.db.commit()
        
        await self.db.refresh(dish)
        return dish
    
    async def delete_dish(self, dish_id: int) -> Dish | None:
        dish = await self.get_dish_by_id(dish_id)
        if dish is None:
            return None
        await self.db.execute(delete(Dish).where(Dish.id == dish_id))
        await self.db.commit()
        return dish