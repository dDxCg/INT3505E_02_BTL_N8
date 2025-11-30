from fastapi import APIRouter, Depends
from configs.postgre import get_db
from sqlalchemy.ext.asyncio import AsyncSession

from repository.resources import DishRepository
from schemas.resources import DishCreate, DishUpdate, DishRead, DishFilter

router = APIRouter(prefix="/resources/dishes", tags=["Dishes"])

@router.get("/", response_model=list[DishRead])
async def get_dishes(
    filter: DishFilter = Depends(),
    db: AsyncSession = Depends(get_db),
):
    dish_repository = DishRepository(db)
    return await dish_repository.get_all_dishes(filter)

@router.post("/", response_model=DishRead)
async def create_dish(
    dish: DishCreate,
    db: AsyncSession = Depends(get_db),
):
    dish_repository = DishRepository(db)
    return await dish_repository.create_dish(dish)

@router.get("/{dish_id}", response_model=DishRead)
async def get_dish_by_id(
    dish_id: int,
    db: AsyncSession = Depends(get_db),
):
    dish_repository = DishRepository(db)
    return await dish_repository.get_dish_by_id(dish_id)

@router.put("/{dish_id}", response_model=DishRead)
async def update_dish(
    dish_id: int,
    dish: DishUpdate,
    db: AsyncSession = Depends(get_db),
):
    dish_repository = DishRepository(db)
    return await dish_repository.update_dish(dish_id, dish)

@router.delete("/{dish_id}", response_model=DishRead)
async def delete_dish(
    dish_id: int,
    db: AsyncSession = Depends(get_db),
):
    dish_repository = DishRepository(db)
    return await dish_repository.delete_dish(dish_id)