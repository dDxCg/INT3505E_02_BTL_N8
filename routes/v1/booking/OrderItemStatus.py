from fastapi import APIRouter, Depends, HTTPException, status
from configs.postgre import get_db
from sqlalchemy.ext.asyncio import AsyncSession

from repository.booking import OrderItemStatusRepository
from schemas.booking import (
	OrderItemStatusFilter,
	OrderItemStatusCreate,
	OrderItemStatusRead,
	OrderItemStatusUpdate,
)


router = APIRouter(prefix="/orders/items/statuses", tags=["OrderItemStatuses"])


@router.post("", response_model=OrderItemStatusRead, status_code=status.HTTP_201_CREATED)
async def create_status(
	payload: OrderItemStatusCreate,
	db: AsyncSession = Depends(get_db),
):
	"""Create a new order item status."""
	try:
		repo = OrderItemStatusRepository(db)
		status_obj = await repo.create_status(payload)
		return status_obj
	except ValueError as e:
		raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("", response_model=list[OrderItemStatusRead])
async def get_statuses(
	filters: OrderItemStatusFilter = Depends(),
	db: AsyncSession = Depends(get_db),
):
	"""List order item statuses (optional filters)."""
	repo = OrderItemStatusRepository(db)
	statuses = await repo.get_all_statuses(filters)
	return statuses


@router.get("/{status_id}", response_model=OrderItemStatusRead)
async def get_status(
	status_id: int,
	db: AsyncSession = Depends(get_db),
):
	repo = OrderItemStatusRepository(db)
	status_obj = await repo.get_status_by_id(status_id)
	if status_obj is None:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Status {status_id} not found")
	return status_obj


@router.put("/{status_id}", response_model=OrderItemStatusRead)
async def update_status(
	status_id: int,
	payload: OrderItemStatusUpdate,
	db: AsyncSession = Depends(get_db),
):
	"""Update an order item status."""
	try:
		repo = OrderItemStatusRepository(db)
		status_obj = await repo.update_status(status_id, payload)
		if status_obj is None:
			raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Status {status_id} not found")
		return status_obj
	except ValueError as e:
		raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/{status_id}", response_model=OrderItemStatusRead)
async def delete_status(
	status_id: int,
	db: AsyncSession = Depends(get_db),
):
	repo = OrderItemStatusRepository(db)
	status_obj = await repo.delete_status(status_id)
	if status_obj is None:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Status {status_id} not found")
	return status_obj


