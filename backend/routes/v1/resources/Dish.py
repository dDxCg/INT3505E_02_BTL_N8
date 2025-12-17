from fastapi import APIRouter, Depends, HTTPException, Query, status, UploadFile, File
from configs.postgre import get_db
from sqlalchemy.ext.asyncio import AsyncSession

from repository.resources import DishRepository
from schemas.resources import DishCreate, DishUpdate, DishRead, DishReadExtended, DishFilter
from services.storage import storage_service

router = APIRouter(prefix="/resources/dishes", tags=["Dishes"])


@router.get("/", response_model=list[DishRead | DishReadExtended])
async def get_dishes(
    include_tags: bool = Query(False, description="Include tags in the response"),
    filter: DishFilter = Depends(),
    db: AsyncSession = Depends(get_db),
):
    """Get all dishes with optional filters and tags."""
    try:
        dish_repository = DishRepository(db)
        return await dish_repository.get_all_dishes(filter, include_tags=include_tags)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get dishes: {str(e)}"
        )


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
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create dish: {str(e)}"
        )


@router.get("/{dish_id}", response_model=DishRead | DishReadExtended)
async def get_dish_by_id(
    dish_id: int,
    include_tags: bool = Query(False, description="Include tags in the response"),
    db: AsyncSession = Depends(get_db),
):
    """Get a dish by ID with optional tags."""
    try:
        dish_repository = DishRepository(db)
        dish = await dish_repository.get_dish_by_id(dish_id, include_tags=include_tags)

        if dish is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Dish with id {dish_id} not found"
            )

        return dish
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get dish: {str(e)}"
        )


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
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update dish: {str(e)}"
        )


@router.delete("/{dish_id}", response_model=DishRead)
async def delete_dish(
    dish_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Delete a dish by ID."""
    try:
        dish_repository = DishRepository(db)
        deleted_dish = await dish_repository.delete_dish(dish_id)

        if deleted_dish is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Dish with id {dish_id} not found"
            )

        return deleted_dish
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete dish: {str(e)}"
        )


@router.post("/{dish_id}/upload-image", response_model=dict)
async def upload_dish_image(
    dish_id: int,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    """
    Upload an image for a specific dish to Supabase Storage.
    Updates the dish's image_url field with the public URL.
    """
    # Validate file type
    allowed_types = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed types: {', '.join(allowed_types)}"
        )

    # Check if dish exists
    dish_repository = DishRepository(db)
    dish = await dish_repository.get_dish_by_id(dish_id)
    if dish is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dish with id {dish_id} not found"
        )

    try:
        # Upload image to Supabase
        image_url = await storage_service.upload_dish_image(
            file=file.file,
            filename=file.filename
        )

        # Update dish with new image URL
        update_data = DishUpdate(image_url=image_url)
        updated_dish = await dish_repository.update_dish(dish_id, update_data)

        return {
            "message": "Image uploaded successfully",
            "image_url": image_url,
            "dish_id": dish_id
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload image: {str(e)}"
        )


@router.delete("/{dish_id}/delete-image", response_model=dict)
async def delete_dish_image(
    dish_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Delete the image for a specific dish from Supabase Storage."""
    try:
        dish_repository = DishRepository(db)
        dish = await dish_repository.get_dish_by_id(dish_id)

        if dish is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Dish with id {dish_id} not found"
            )

        if not dish.image_url:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Dish does not have an image to delete"
            )

        # Store the image URL before deleting
        image_url_to_delete = dish.image_url

        # Delete from Supabase Storage (this will raise exception if it fails)
        await storage_service.delete_dish_image(image_url_to_delete)

        # Update dish to remove image URL (set to NULL in database)
        update_data = DishUpdate(image_url=None)
        await dish_repository.update_dish(dish_id, update_data, allow_null_image=True)

        return {
            "message": "Image deleted successfully",
            "dish_id": dish_id,
            "deleted_url": image_url_to_delete
        }
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid image URL: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete image: {str(e)}"
        )