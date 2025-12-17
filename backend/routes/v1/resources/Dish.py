from fastapi import APIRouter, Depends, HTTPException, Query, status
from configs.postgre import get_db
from sqlalchemy.ext.asyncio import AsyncSession

from repository.resources import DishRepository
from schemas.resources import DishCreate, DishUpdate, DishRead, DishReadExtended, DishFilter

router = APIRouter(prefix="/resources/dishes", tags=["Dishes"])


@router.get("/", response_model=list[DishRead | DishReadExtended])
async def get_dishes(
    include_tags: bool = Query(False, description="Include tags in the response"),
    filter: DishFilter = Depends(),
    db: AsyncSession = Depends(get_db),
):
    """Get all dishes with optional filters and tags."""
    dish_repository = DishRepository(db)
    return await dish_repository.get_all_dishes(filter, include_tags=include_tags)


@router.post("/", response_model=DishReadExtended, status_code=status.HTTP_201_CREATED)
async def create_dish(
    dish: DishCreate,
    db: AsyncSession = Depends(get_db),
):
    """Create a new dish with optional tags."""
    dish_repository = DishRepository(db)
    try:
        return await dish_repository.create_dish(dish)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/{dish_id}", response_model=DishRead | DishReadExtended)
async def get_dish_by_id(
    dish_id: int,
    include_tags: bool = Query(False, description="Include tags in the response"),
    db: AsyncSession = Depends(get_db),
):
    """Get a dish by ID with optional tags."""
    dish_repository = DishRepository(db)
    dish = await dish_repository.get_dish_by_id(dish_id, include_tags=include_tags)

    if dish is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dish with id {dish_id} not found"
        )

    return dish


@router.put("/{dish_id}", response_model=DishReadExtended)
async def update_dish(
    dish_id: int,
    dish: DishUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Update a dish by ID, including tags."""
    dish_repository = DishRepository(db)
    try:
        updated_dish = await dish_repository.update_dish(dish_id, dish)

        if updated_dish is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Dish with id {dish_id} not found"
            )

        return updated_dish
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.delete("/{dish_id}", response_model=DishRead)
async def delete_dish(
    dish_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Delete a dish by ID."""
    dish_repository = DishRepository(db)
    deleted_dish = await dish_repository.delete_dish(dish_id)

    if deleted_dish is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dish with id {dish_id} not found"
        )

    return deleted_dish