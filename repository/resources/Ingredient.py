from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import delete, select, update
from models import Ingredient, IngredientUnit
from schemas.resources import (
    IngredientCreate,
    IngredientUpdate, 
    IngredientFilter,
    IngredientUnitCreate,
    IngredientUnitUpdate,
    IngredientUnitFilter)

class IngredientRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_ingredient(self, data: IngredientCreate) -> Ingredient:
        ingredient = Ingredient(**data.model_dump())
        self.db.add(ingredient)
        await self.db.commit()
        await self.db.refresh(ingredient)
        return ingredient
    
    async def get_all(self, filters: IngredientFilter) -> list[Ingredient]:
        query = select(Ingredient)
        conditions = []

        if filters.name is not None:
            conditions.append(Ingredient.name.ilike(f"%{filters.name}%"))
        if filters.unit_id is not None:
            conditions.append(Ingredient.unit_id == filters.unit_id)

        if conditions:
            query = query.where(*conditions)

        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def get_by_id(self, ingredient_id: int) -> Ingredient | None:
        result = await self.db.execute(select(Ingredient).where(Ingredient.id == ingredient_id))
        return result.scalar_one_or_none()
    
    async def update_ingredient(self, ingredient_id: int, data: IngredientUpdate) -> Ingredient | None:
        ingredient = await self.get_by_id(ingredient_id)
        if not ingredient:
            return None

        update_data = {}
        for k, v in data.model_dump().items():
            if v is not None:
                update_data[k] = v

        if not update_data:
            return ingredient

        await self.db.execute(
            update(Ingredient).where(Ingredient.id == ingredient_id).values(**update_data)
        )
        await self.db.commit()
        await self.db.refresh(ingredient)
        return ingredient
    
    async def delete_ingredient(self, ingredient_id: int) -> Ingredient | None:
        ingredient = await self.get_by_id(ingredient_id)
        if ingredient:
            await self.db.execute(delete(Ingredient).where(Ingredient.id == ingredient_id))
            await self.db.commit()
        return ingredient
    

class IngredientUnitRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_ingredient_unit(self, data: IngredientUnitCreate) -> IngredientUnit:
        unit = IngredientUnit(**data.model_dump())
        self.db.add(unit)
        await self.db.commit()
        await self.db.refresh(unit)
        return unit
    
    async def get_all(self, filters: IngredientUnitFilter) -> list[IngredientUnit]:
        query = select(IngredientUnit)
        conditions = []

        if filters.name is not None:
            conditions.append(IngredientUnit.name.ilike(f"%{filters.name}%"))

        if conditions:
            query = query.where(*conditions)

        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def get_by_id(self, unit_id: int) -> IngredientUnit | None:
        result = await self.db.execute(select(IngredientUnit).where(IngredientUnit.id == unit_id))
        return result.scalar_one_or_none()
    
    async def update_ingredient_unit(self, unit_id: int, data: IngredientUnitUpdate) -> IngredientUnit | None:
        unit = await self.get_by_id(unit_id)
        if not unit:
            return None

        update_data = {}
        for k, v in data.model_dump().items():
            if v is not None:
                update_data[k] = v

        if not update_data:
            return unit

        await self.db.execute(
            update(IngredientUnit).where(IngredientUnit.id == unit_id).values(**update_data)
        )
        await self.db.commit()
        await self.db.refresh(unit)
        return unit
    
    async def delete_ingredient_unit(self, unit_id: int) -> IngredientUnit | None:
        unit = await self.get_by_id(unit_id)
        if unit:
            await self.db.execute(delete(IngredientUnit).where(IngredientUnit.id == unit_id))
            await self.db.commit()
        return unit