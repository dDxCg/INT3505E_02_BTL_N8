from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, and_
from models import Tag
from schemas.resources import TagCreate, TagUpdate, TagFilter


class TagRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_tag(self, data: TagCreate) -> Tag:
        """Create a new tag."""
        tag = Tag(**data.model_dump())
        self.db.add(tag)
        await self.db.commit()
        await self.db.refresh(tag)
        return tag

    async def get_all_tags(self, filters: TagFilter) -> list[Tag]:
        """Get all tags with optional filters."""
        query = select(Tag)
        conditions = []

        if filters.name is not None:
            conditions.append(Tag.name.ilike(f"%{filters.name}%"))

        if conditions:
            query = query.where(and_(*conditions))

        result = await self.db.execute(query)
        return result.scalars().all()

    async def get_tag_by_id(self, tag_id: int) -> Tag | None:
        """Get a tag by ID."""
        result = await self.db.execute(select(Tag).where(Tag.id == tag_id))
        return result.scalar_one_or_none()

    async def update_tag(self, tag_id: int, data: TagUpdate) -> Tag | None:
        """Update a tag by ID."""
        tag = await self.get_tag_by_id(tag_id)
        if tag is None:
            return None

        update_data = {k: v for k, v in data.model_dump().items() if v is not None}
        if not update_data:
            return tag

        await self.db.execute(update(Tag).where(Tag.id == tag_id).values(**update_data))
        await self.db.commit()
        await self.db.refresh(tag)
        return tag

    async def delete_tag(self, tag_id: int) -> Tag | None:
        """Delete a tag by ID."""
        tag = await self.get_tag_by_id(tag_id)
        if tag is None:
            return None

        await self.db.execute(delete(Tag).where(Tag.id == tag_id))
        await self.db.commit()
        return tag

    async def get_tags_by_ids(self, tag_ids: list[int]) -> list[Tag]:
        """Get multiple tags by their IDs."""
        if not tag_ids:
            return []

        result = await self.db.execute(select(Tag).where(Tag.id.in_(tag_ids)))
        return result.scalars().all()
