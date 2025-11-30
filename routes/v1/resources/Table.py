from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from configs.postgre import get_db
from repository.resources import TableRepository
from schemas.resources import (
    TableCreate,
    TableUpdate,
    TableRead,
    TableFilter,
)

router = APIRouter(prefix="/tables", tags=["Tables"])


@router.post("", response_model=TableRead, status_code=status.HTTP_201_CREATED)
async def create_table(
    payload: TableCreate,
    db: AsyncSession = Depends(get_db),
):
    """Create a new table."""
    try:
        table_repo = TableRepository(db)
        return await table_repo.create_table(payload)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("", response_model=list[TableRead])
async def get_tables(
    filters: TableFilter = Depends(),
    db: AsyncSession = Depends(get_db),
):
    """Get all tables with optional filters."""
    table_repo = TableRepository(db)
    return await table_repo.get_all_tables(filters)


@router.get("/{table_id}", response_model=TableRead)
async def get_table(
    table_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Get table by id."""
    table_repo = TableRepository(db)
    table = await table_repo.get_table_by_id(table_id)
    
    if table is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Table {table_id} not found"
        )
    return table


@router.put("/{table_id}", response_model=TableRead)
async def update_table(
    table_id: int,
    payload: TableUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Update table info."""
    try:
        table_repo = TableRepository(db)
        table = await table_repo.update_table(table_id, payload)
        
        if table is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Table {table_id} not found"
            )
        return table
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.delete("/{table_id}", response_model=TableRead)
async def delete_table(
    table_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Delete table."""
    table_repo = TableRepository(db)
    table = await table_repo.delete_table(table_id)
    
    if table is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Table {table_id} not found"
        )
    return table
