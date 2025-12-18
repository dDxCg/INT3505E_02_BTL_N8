from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import and_, delete, select, update
from sqlalchemy.orm import selectinload
from models import Dish, Tag
from schemas.resources import (
    DishCreate,
    DishFilter,
    DishUpdate,
)


class DishRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_dish(self, data: DishCreate) -> Dish:
        """Create a new dish with optional tags."""
        # Extract tag_ids before creating the dish
        tag_ids = data.tag_ids
        dish_data = data.model_dump(exclude={'tag_ids'})

        dish = Dish(**dish_data)

        # If tag_ids provided, fetch and associate tags
        if tag_ids:
            tags = await self._get_tags_by_ids(tag_ids)
            if len(tags) != len(tag_ids):
                found_ids = {tag.id for tag in tags}
                missing_ids = set(tag_ids) - found_ids
                raise ValueError(f"Tags with ids {missing_ids} do not exist.")
            dish.tags = tags

        self.db.add(dish)
        await self.db.commit()
        await self.db.refresh(dish)

        # Reload dish with tags relationship loaded
        result = await self.db.execute(
            select(Dish)
            .where(Dish.id == dish.id)
            .options(selectinload(Dish.tags))
        )
        return result.scalar_one()

    async def get_all_dishes(self, filters: DishFilter, include_tags: bool = False) -> list[Dish]:
        """Get all dishes with optional filters and eager load tags if requested."""
        query = select(Dish)

        # Eager load tags if requested
        if include_tags:
            query = query.options(selectinload(Dish.tags))

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

    async def get_dish_by_id(self, dish_id: int, include_tags: bool = False) -> Dish | None:
        """Get a dish by ID with optional tags eager loading."""
        query = select(Dish).where(Dish.id == dish_id)

        if include_tags:
            query = query.options(selectinload(Dish.tags))

        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def update_dish(self, dish_id: int, data: DishUpdate, allow_null_image: bool = False) -> Dish | None:
        """Update a dish by ID, including tag associations."""
        dish = await self.get_dish_by_id(dish_id)
        if dish is None:
            return None

        # Extract tag_ids from update data
        tag_ids = data.tag_ids

        # Get all fields from the update data
        all_data = data.model_dump(exclude={'tag_ids'})

        # Separate handling for fields that can be explicitly set to None vs fields that are just not provided
        update_data = {}

        # Check which fields were explicitly set (not just defaulted to None)
        set_fields = data.model_dump(exclude_unset=True, exclude={'tag_ids'})

        for key, value in all_data.items():
            # If the field was explicitly set
            if key in set_fields:
                # For image_url, allow None if flag is set (for explicit clearing)
                if key == 'image_url' and value is None and allow_null_image:
                    update_data[key] = None
                # For other fields, only include non-None values
                elif value is not None:
                    update_data[key] = value
                # Special case: image_url being set to None when allow_null_image is True
                elif key == 'image_url' and allow_null_image:
                    update_data[key] = None

        # Update basic fields if any
        if update_data:
            await self.db.execute(
                update(Dish)
                .where(Dish.id == dish_id)
                .values(**update_data)
            )

        # Update tags if tag_ids is provided (even if empty list to clear tags)
        if tag_ids is not None:
            if tag_ids:
                tags = await self._get_tags_by_ids(tag_ids)
                if len(tags) != len(tag_ids):
                    found_ids = {tag.id for tag in tags}
                    missing_ids = set(tag_ids) - found_ids
                    raise ValueError(f"Tags with ids {missing_ids} do not exist.")
                dish.tags = tags
            else:
                # Clear all tags if empty list provided
                dish.tags = []

        await self.db.commit()

        # Reload dish with tags relationship loaded
        result = await self.db.execute(
            select(Dish)
            .where(Dish.id == dish_id)
            .options(selectinload(Dish.tags))
        )
        return result.scalar_one()

    async def delete_dish(self, dish_id: int) -> Dish | None:
        """Delete a dish by ID."""
        dish = await self.get_dish_by_id(dish_id)
        if dish is None:
            return None
        await self.db.execute(delete(Dish).where(Dish.id == dish_id))
        await self.db.commit()
        return dish

    async def _get_tags_by_ids(self, tag_ids: list[int]) -> list[Tag]:
        """Helper method to fetch tags by their IDs."""
        if not tag_ids:
            return []
        result = await self.db.execute(select(Tag).where(Tag.id.in_(tag_ids)))
        return result.scalars().all()