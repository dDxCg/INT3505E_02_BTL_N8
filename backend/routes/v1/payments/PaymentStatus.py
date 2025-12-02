# routes/v1/payments/PaymentStatus.py
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from configs.postgre import get_db
from schemas.payments.payments import (
    PaymentStatusRead,
    PaymentStatusCreate,
    PaymentStatusUpdate,
)
from repository.payments.PaymentStatus import PaymentStatusRepository

router = APIRouter(
    prefix="/payment-statuses",
    tags=["Payment Statuses"],
)

@router.get("", response_model=List[PaymentStatusRead])
async def list_payment_statuses(
    db: AsyncSession = Depends(get_db),
):
    repo = PaymentStatusRepository(db)
    statuses = await repo.get_all()
    # map sang schema
    return [
        PaymentStatusRead.model_validate(s, from_attributes=True)
        for s in statuses
    ]

@router.get("/{status_id}", response_model=PaymentStatusRead)
async def get_payment_status(
    status_id: int,
    db: AsyncSession = Depends(get_db),
):
    repo = PaymentStatusRepository(db)
    status_obj = await repo.get_by_id(status_id)
    if status_obj is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment status not found",
        )
    return PaymentStatusRead.model_validate(status_obj, from_attributes=True)

@router.post(
    "",
    response_model=PaymentStatusRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_payment_status(
    payload: PaymentStatusCreate,
    db: AsyncSession = Depends(get_db),
):
    repo = PaymentStatusRepository(db)
    status_obj = await repo.create(payload)
    return PaymentStatusRead.model_validate(status_obj, from_attributes=True)

@router.put("/{status_id}", response_model=PaymentStatusRead)
async def update_payment_status(
    status_id: int,
    payload: PaymentStatusUpdate,
    db: AsyncSession = Depends(get_db),
):
    repo = PaymentStatusRepository(db)
    status_obj = await repo.get_by_id(status_id)
    if status_obj is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment status not found",
        )

    status_obj = await repo.update(status_obj, payload)
    return PaymentStatusRead.model_validate(status_obj, from_attributes=True)

@router.delete(
    "/{status_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_payment_status(
    status_id: int,
    db: AsyncSession = Depends(get_db),
):
    repo = PaymentStatusRepository(db)
    status_obj = await repo.get_by_id(status_id)
    if status_obj is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment status not found",
        )

    await repo.delete(status_obj)
    return None
