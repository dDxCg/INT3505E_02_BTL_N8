from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from configs.postgre import get_db

from repository.resources import IngredientUnitRepository
from schemas.resources import IngredientUnitCreate, IngredientUnitUpdate, IngredientUnitRead, IngredientUnitFilter

router = APIRouter(prefix="/resources/ingredient-units", tags=["Ingredient Units"])

@router.post("/", response_model=IngredientUnitRead)
async def create_ingredient_unit(
    ingredient_unit: IngredientUnitCreate,
    db: AsyncSession = Depends(get_db),
):
    ingredient_unit_repository = IngredientUnitRepository(db)
    return await ingredient_unit_repository.create_ingredient_unit(ingredient_unit)


@router.get("/", response_model=list[IngredientUnitRead])
async def get_ingredient_units(
    filter: IngredientUnitFilter = Depends(),
    db: AsyncSession = Depends(get_db),
):
    ingredient_unit_repository = IngredientUnitRepository(db)
    return await ingredient_unit_repository.get_all_ingredient_units(filter)


@router.get("/{ingredient_unit_id}", response_model=IngredientUnitRead)
async def get_ingredient_unit_by_id(
    ingredient_unit_id: int,
    db: AsyncSession = Depends(get_db),
):
    ingredient_unit_repository = IngredientUnitRepository(db)
    return await ingredient_unit_repository.get_ingredient_unit_by_id(ingredient_unit_id)


@router.put("/{ingredient_unit_id}", response_model=IngredientUnitRead)
async def update_ingredient_unit(
    ingredient_unit_id: int,
    ingredient_unit: IngredientUnitUpdate,
    db: AsyncSession = Depends(get_db),
):
    ingredient_unit_repository = IngredientUnitRepository(db)
    return await ingredient_unit_repository.update_ingredient_unit(ingredient_unit_id, ingredient_unit)


@router.delete("/{ingredient_unit_id}", response_model=IngredientUnitRead)
async def delete_ingredient_unit(
    ingredient_unit_id: int,
    db: AsyncSession = Depends(get_db),
):
    ingredient_unit_repository = IngredientUnitRepository(db)
    return await ingredient_unit_repository.delete_ingredient_unit(ingredient_unit_id)