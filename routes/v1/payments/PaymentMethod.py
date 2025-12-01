from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from configs.postgre import get_db
from repository.payments.PaymentMethod import PaymentMethodRepository
from schemas.payments.payments import (
    PaymentMethodRead,
    PaymentMethodCreate,
    PaymentMethodUpdate,
)

router = APIRouter(prefix="/payment-methods", tags=["Payment Methods"])


@router.get("", response_model=list[PaymentMethodRead])
async def list_payment_methods(
    db: AsyncSession = Depends(get_db),
):
    repo = PaymentMethodRepository(db)
    methods = await repo.get_all()
    return methods


@router.get("/{method_id}", response_model=PaymentMethodRead)
async def get_payment_method(
    method_id: int,
    db: AsyncSession = Depends(get_db),
):
    repo = PaymentMethodRepository(db)
    method = await repo.get_by_id(method_id)
    if method is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment method not found",
        )
    return method


@router.post(
    "",
    response_model=PaymentMethodRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_payment_method(
    payload: PaymentMethodCreate,
    db: AsyncSession = Depends(get_db),
):
    repo = PaymentMethodRepository(db)
    try:
        method = await repo.create(payload)
    except ValueError as e:
        if str(e) == "METHOD_NAME_EXISTS":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Payment method name already exists",
            )
        raise
    return method


@router.put("/{method_id}", response_model=PaymentMethodRead)
async def update_payment_method(
    method_id: int,
    payload: PaymentMethodUpdate,
    db: AsyncSession = Depends(get_db),
):
    repo = PaymentMethodRepository(db)
    try:
        method = await repo.update(method_id, payload)
    except ValueError as e:
        if str(e) == "METHOD_NAME_EXISTS":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Payment method name already exists",
            )
        raise

    if method is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment method not found",
        )
    return method


@router.delete(
    "/{method_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_payment_method(
    method_id: int,
    db: AsyncSession = Depends(get_db),
):
    repo = PaymentMethodRepository(db)
    deleted = await repo.delete(method_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment method not found",
        )
    # 204: không return body
