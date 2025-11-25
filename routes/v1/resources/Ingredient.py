from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from configs.postgre import get_db

from repository.resources import IngredientRepository
from schemas.resources import IngredientCreate, IngredientUpdate, IngredientRead, IngredientFilter

router = APIRouter(prefix="/resources/ingredients", tags=["Ingredients"])


@router.post("/", response_model=IngredientRead)
async def create_ingredient(
    ingredient: IngredientCreate,
    db: AsyncSession = Depends(get_db),
):
    ingredient_repository = IngredientRepository(db)
    return await ingredient_repository.create_ingredient(ingredient)


@router.get("/", response_model=list[IngredientRead])
async def get_ingredients(
    filter: IngredientFilter = Depends(),
    db: AsyncSession = Depends(get_db),
):
    ingredient_repository = IngredientRepository(db)
    return await ingredient_repository.get_all_ingredients(filter)


@router.get("/{ingredient_id}", response_model=IngredientRead)
async def get_ingredient_by_id(
    ingredient_id: int,
    db: AsyncSession = Depends(get_db),
):
    ingredient_repository = IngredientRepository(db)
    return await ingredient_repository.get_ingredient_by_id(ingredient_id)


@router.put("/{ingredient_id}", response_model=IngredientRead)
async def update_ingredient(
    ingredient_id: int,
    ingredient: IngredientUpdate,
    db: AsyncSession = Depends(get_db),
):
    ingredient_repository = IngredientRepository(db)
    return await ingredient_repository.update_ingredient(ingredient_id, ingredient)


@router.delete("/{ingredient_id}", response_model=IngredientRead)
async def delete_ingredient(
    ingredient_id: int,
    db: AsyncSession = Depends(get_db),
):
    ingredient_repository = IngredientRepository(db)
    return await ingredient_repository.delete_ingredient(ingredient_id)