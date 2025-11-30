from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from configs.postgre import get_db

from repository.resources import IngredientHistoryRepository
from schemas.resources import IngredientHistoryCreate, IngredientHistoryUpdate, IngredientHistoryRead, IngredientHistoryFilter

router = APIRouter(prefix="/resources/ingredient-histories", tags=["Ingredient Histories"])


@router.post("/", response_model=IngredientHistoryRead)
async def create_ingredient_history(
    ingredient_history: IngredientHistoryCreate,
    db: AsyncSession = Depends(get_db),
):
    ingredient_history_repository = IngredientHistoryRepository(db)
    return await ingredient_history_repository.create_ingredient_history(ingredient_history)


@router.get("/", response_model=list[IngredientHistoryRead])
async def get_ingredient_histories(
    filter: IngredientHistoryFilter = Depends(),
    db: AsyncSession = Depends(get_db),
):
    ingredient_history_repository = IngredientHistoryRepository(db)
    return await ingredient_history_repository.get_all_ingredient_histories(filter)


@router.get("/{ingredient_history_id}", response_model=IngredientHistoryRead)
async def get_ingredient_history_by_id(
    ingredient_history_id: int,
    db: AsyncSession = Depends(get_db),
):
    ingredient_history_repository = IngredientHistoryRepository(db)
    return await ingredient_history_repository.get_ingredient_history_by_id(ingredient_history_id)


@router.put("/{ingredient_history_id}", response_model=IngredientHistoryRead)
async def update_ingredient_history(
    ingredient_history_id: int,
    ingredient_history: IngredientHistoryUpdate,
    db: AsyncSession = Depends(get_db),
):
    ingredient_history_repository = IngredientHistoryRepository(db)
    return await ingredient_history_repository.update_ingredient_history(ingredient_history_id, ingredient_history)


@router.delete("/{ingredient_history_id}", response_model=IngredientHistoryRead)
async def delete_ingredient_history(
    ingredient_history_id: int,
    db: AsyncSession = Depends(get_db),
):
    ingredient_history_repository = IngredientHistoryRepository(db)
    return await ingredient_history_repository.delete_ingredient_history(ingredient_history_id)