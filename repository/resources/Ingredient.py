from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import delete, select, update
from models import Ingredient, IngredientUnit, IngredientHistory
from schemas.resources import (
    IngredientCreate,
    IngredientUpdate, 
    IngredientFilter,
    IngredientUnitCreate,
    IngredientUnitUpdate,
    IngredientUnitFilter,
    IngredientHistoryCreate,
    IngredientHistoryUpdate,
    IngredientHistoryFilter)

class IngredientRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_ingredient(self, data: IngredientCreate) -> Ingredient:
        unit = await self.db.execute(select(IngredientUnit).where(IngredientUnit.id == data.unit_id))
        if (unit.scalar_one_or_none() is None):
            raise ValueError(f"IngredientUnit with id {data.unit_id} does not exist.")
        ingredient = Ingredient(**data.model_dump())
        self.db.add(ingredient)
        await self.db.commit()
        await self.db.refresh(ingredient)
        return ingredient
    
    async def get_all_ingredients(self, filters: IngredientFilter) -> list[Ingredient]:
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
    
    async def get_ingredient_by_id(self, ingredient_id: int) -> Ingredient | None:
        result = await self.db.execute(select(Ingredient).where(Ingredient.id == ingredient_id))
        return result.scalar_one_or_none()
    
    async def update_ingredient(self, ingredient_id: int, data: IngredientUpdate) -> Ingredient | None:
        ingredient = await self.get_ingredient_by_id(ingredient_id)
        if not ingredient:
            return None

        update_data = {}
        for k, v in data.model_dump().items():
            if v is not None:
                update_data[k] = v

        if not update_data:
            return ingredient

        if "unit_id" in update_data:
            unit = await self.db.execute(select(IngredientUnit).where(IngredientUnit.id == update_data["unit_id"]))
            if (unit.scalar_one_or_none() is None):
                raise ValueError(f"IngredientUnit with id {update_data['unit_id']} does not exist.")

        await self.db.execute(
            update(Ingredient).where(Ingredient.id == ingredient_id).values(**update_data)
        )
        await self.db.commit()
        await self.db.refresh(ingredient)
        return ingredient
    
    async def delete_ingredient(self, ingredient_id: int) -> Ingredient | None:
        ingredient = await self.get_ingredient_by_id(ingredient_id)
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
    
    async def get_all_ingredient_units(self, filters: IngredientUnitFilter) -> list[IngredientUnit]:
        query = select(IngredientUnit)
        conditions = []

        if filters.name is not None:
            conditions.append(IngredientUnit.name.ilike(f"%{filters.name}%"))

        if conditions:
            query = query.where(*conditions)

        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def get_ingredient_unit_by_id(self, unit_id: int) -> IngredientUnit | None:
        result = await self.db.execute(select(IngredientUnit).where(IngredientUnit.id == unit_id))
        return result.scalar_one_or_none()
    
    async def update_ingredient_unit(self, unit_id: int, data: IngredientUnitUpdate) -> IngredientUnit | None:
        unit = await self.get_ingredient_unit_by_id(unit_id)
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
        unit = await self.get_ingredient_unit_by_id(unit_id)
        if unit:
            await self.db.execute(delete(IngredientUnit).where(IngredientUnit.id == unit_id))
            await self.db.commit()
        return unit
    

class IngredientHistoryRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_ingredient_history(self, data: IngredientHistoryCreate) -> IngredientHistory:
        ingredient = await self.db.execute(select(Ingredient).where(Ingredient.id == data.ingredient_id))
        if (ingredient.scalar_one_or_none() is None):
            raise ValueError(f"Ingredient with id {data.ingredient_id} does not exist.")
        history = IngredientHistory(**data.model_dump())
        self.db.add(history)
        await self.db.commit()
        await self.db.refresh(history)
        return history
    
    async def get_all_ingredient_histories(self, filters: IngredientHistoryFilter) -> list[IngredientHistory]:
        query = select(IngredientHistory)
        conditions = []

        if filters.ingredient_id is not None:
            conditions.append(IngredientHistory.ingredient_id == filters.ingredient_id)

        if conditions:
            query = query.where(*conditions)

        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def get_ingredient_history_by_id(self, history_id: int) -> IngredientHistory | None:
        result = await self.db.execute(select(IngredientHistory).where(IngredientHistory.id == history_id))
        return result.scalar_one_or_none()
    
    async def update_ingredient_history(self, history_id: int, data: IngredientHistoryUpdate) -> IngredientHistory | None:
        history = await self.get_ingredient_history_by_id(history_id)
        if not history:
            return None

        update_data = {}
        for k, v in data.model_dump().items():
            if v is not None:
                update_data[k] = v

        if not update_data:
            return history
        
        if "ingredient_id" in update_data:
            ingredient = await self.db.execute(select(Ingredient).where(Ingredient.id == update_data["ingredient_id"]))
            if (ingredient.scalar_one_or_none() is None):
                raise ValueError(f"Ingredient with id {update_data['ingredient_id']} does not exist.")

        await self.db.execute(
            update(IngredientHistory).where(IngredientHistory.id == history_id).values(**update_data)
        )
        await self.db.commit()
        await self.db.refresh(history)
        return history
    
    async def delete_ingredient_history(self, history_id: int) -> IngredientHistory | None:
        history = await self.get_ingredient_history_by_id(history_id)
        if history:
            await self.db.execute(delete(IngredientHistory).where(IngredientHistory.id == history_id))
            await self.db.commit()
        return history