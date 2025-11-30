from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from configs.postgre import get_db
from repository.booking import OrderStatusRepository
from schemas.booking import (
	OrderStatusCreate,
	OrderStatusRead,
	OrderStatusUpdate,
	OrderStatusFilter,
)


router = APIRouter(prefix="/order/statuses", tags=["OrderStatuses"])


@router.post("", response_model=OrderStatusRead, status_code=status.HTTP_201_CREATED)
async def create_status(
	payload: OrderStatusCreate,
	db: AsyncSession = Depends(get_db),
):
	"""Create a new order status."""
	try:
		repo = OrderStatusRepository(db)
		return await repo.create_status(payload)
	except ValueError as e:
		raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("", response_model=list[OrderStatusRead])
async def get_statuses(
	filters: OrderStatusFilter = Depends(),
	db: AsyncSession = Depends(get_db),
):
	"""Get all order statuses (optional filters)."""
	repo = OrderStatusRepository(db)
	return await repo.get_all_statuses(filters)


@router.get("/{status_id}", response_model=OrderStatusRead)
async def get_status(
	status_id: int,
	db: AsyncSession = Depends(get_db),
):
	"""Get a single status by id."""
	repo = OrderStatusRepository(db)
	status_obj = await repo.get_status_by_id(status_id)
	if status_obj is None:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Status {status_id} not found")
	return status_obj


@router.put("/{status_id}", response_model=OrderStatusRead)
async def update_status(
	status_id: int,
	payload: OrderStatusUpdate,
	db: AsyncSession = Depends(get_db),
):
	"""Update an existing order status."""
	try:
		repo = OrderStatusRepository(db)
		status_obj = await repo.update_status(status_id, payload)
		if status_obj is None:
			raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Status {status_id} not found")
		return status_obj
	except ValueError as e:
		raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/{status_id}", response_model=OrderStatusRead)
async def delete_status(
	status_id: int,
	db: AsyncSession = Depends(get_db),
):
	"""Delete an order status."""
	repo = OrderStatusRepository(db)
	status_obj = await repo.delete_status(status_id)
	if status_obj is None:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Status {status_id} not found")
	return status_obj


