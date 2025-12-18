from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from configs.postgre import get_db
from repository.resources import TableStatusRepository
from schemas.resources import (TableStatusRead, TableStatusCreate, TableStatusFilter, TableStatusUpdate)

router = APIRouter(prefix="/tables-statuses", tags=["Tables"])

@router.post("", response_model=TableStatusRead, status_code=status.HTTP_201_CREATED)
async def create_table_status(
    payload: TableStatusCreate,
    db: AsyncSession = Depends(get_db)
):
    try:
        repos = TableStatusRepository(db)
        return await repos.create_table_status(payload)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("", response_model=list[TableStatusRead])
async def get_table_statuses(
    filters: TableStatusFilter = Depends(),
    db: AsyncSession = Depends(get_db)
):
    repos = TableStatusRepository(db)
    statuses = await repos.get_all_table_statuses(filters) 
    print(type(statuses[0]), statuses[0].__dict__) 
    return statuses

@router.get("/{status_id}", response_model=TableStatusRead)
async def get_table_status(
    status_id: int,
    db: AsyncSession = Depends(get_db)
):
    repos = TableStatusRepository(db)
    status_obj = await repos.get_table_status_by_id(status_id)
    if status_obj is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Status {status_id} not found")
    return status_obj


@router.put("/{status_id}", response_model=TableStatusRead)
async def update_table_status(
    status_id: int,
    payload: TableStatusUpdate,
    db: AsyncSession = Depends(get_db)
):
    try:
        repos = TableStatusRepository(db)
        status_obj = await repos.update_table_status(status_id, payload)
        if status_obj is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Status {status_id} not found")
        return status_obj
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/{status_id}", response_model=TableStatusRead)
async def delete_table_status(
    status_id: int,
    db: AsyncSession = Depends(get_db)
):
    repos = TableStatusRepository(db)
    status_obj = await repos.delete_table_status(status_id)
    if status_obj is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Status {status_id} not found")
    return status_obj
