from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from configs.postgre import get_db
from repository.resources import TagRepository
from schemas.resources import TagCreate, TagUpdate, TagRead, TagFilter

router = APIRouter(prefix="/resources/tags", tags=["Tags"])


@router.get("/", response_model=list[TagRead])
async def get_tags(
    filter: TagFilter = Depends(),
    db: AsyncSession = Depends(get_db),
):
    """Get all tags with optional filters."""
    tag_repository = TagRepository(db)
    return await tag_repository.get_all_tags(filter)


@router.post("/", response_model=TagRead, status_code=status.HTTP_201_CREATED)
async def create_tag(
    tag: TagCreate,
    db: AsyncSession = Depends(get_db),
):
    """Create a new tag."""
    tag_repository = TagRepository(db)
    try:
        return await tag_repository.create_tag(tag)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/{tag_id}", response_model=TagRead)
async def get_tag_by_id(
    tag_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Get a tag by ID."""
    tag_repository = TagRepository(db)
    tag = await tag_repository.get_tag_by_id(tag_id)

    if tag is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tag with id {tag_id} not found"
        )

    return tag


@router.put("/{tag_id}", response_model=TagRead)
async def update_tag(
    tag_id: int,
    tag: TagUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Update a tag by ID."""
    tag_repository = TagRepository(db)
    updated_tag = await tag_repository.update_tag(tag_id, tag)

    if updated_tag is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tag with id {tag_id} not found"
        )

    return updated_tag


@router.delete("/{tag_id}", response_model=TagRead)
async def delete_tag(
    tag_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Delete a tag by ID."""
    tag_repository = TagRepository(db)
    deleted_tag = await tag_repository.delete_tag(tag_id)

    if deleted_tag is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tag with id {tag_id} not found"
        )

    return deleted_tag
