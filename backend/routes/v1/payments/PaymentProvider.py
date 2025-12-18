from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from configs.postgre import get_db
from repository.payments.PaymentProvider import PaymentProviderRepository
from schemas.payments.payments import (
    PaymentProviderRead,
    PaymentProviderCreate,
    PaymentProviderUpdate,
)

router = APIRouter(prefix="/payment-providers", tags=["Payment Providers"])


@router.get("", response_model=list[PaymentProviderRead])
async def list_payment_providers(db: AsyncSession = Depends(get_db)):
    repo = PaymentProviderRepository(db)
    return await repo.get_all()


@router.get("/{provider_id}", response_model=PaymentProviderRead)
async def get_payment_provider(
    provider_id: int,
    db: AsyncSession = Depends(get_db),
):
    repo = PaymentProviderRepository(db)
    provider = await repo.get_by_id(provider_id)
    if provider is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment provider not found",
        )
    return provider


@router.post(
    "",
    response_model=PaymentProviderRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_payment_provider(
    payload: PaymentProviderCreate,
    db: AsyncSession = Depends(get_db),
):
    repo = PaymentProviderRepository(db)
    return await repo.create(payload)


@router.put("/{provider_id}", response_model=PaymentProviderRead)
async def update_payment_provider(
    provider_id: int,
    payload: PaymentProviderUpdate,
    db: AsyncSession = Depends(get_db),
):
    repo = PaymentProviderRepository(db)
    provider = await repo.update(provider_id, payload)
    if provider is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment provider not found",
        )
    return provider


@router.delete("/{provider_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_payment_provider(
    provider_id: int,
    db: AsyncSession = Depends(get_db),
):
    repo = PaymentProviderRepository(db)
    deleted = await repo.delete(provider_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment provider not found",
        )
    # 204: không trả body
    return None
