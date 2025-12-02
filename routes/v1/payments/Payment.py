# routes/v1/payments/Payment.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from configs.postgre import get_db
from schemas.payments import (
    Payment,
    PaymentCreate,
    PaymentUpdate,
    PaymentWebhookPayload,
    PaymentRefund,
)
from repository.payments.payments import (
    list_payments_repo,
    get_payment_repo,
    create_payment_repo,
    update_payment_status_repo,
    handle_webhook_repo,
    refund_payment_repo,
)

router = APIRouter(prefix="/payments", tags=["Payments"])


@router.get("", response_model=list[Payment])
async def list_payments(
    booking_id: int | None = None,
    status_id: int | None = None,
    db: AsyncSession = Depends(get_db),
):
    return await list_payments_repo(db, booking_id=booking_id, status_id=status_id)


@router.get("/{payment_id}", response_model=Payment)
async def get_payment(
    payment_id: int,
    db: AsyncSession = Depends(get_db),
):
    payment = await get_payment_repo(db, payment_id)
    if payment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy Payment"
        )
    return payment


@router.post("", response_model=Payment, status_code=status.HTTP_201_CREATED)
async def create_payment(
    payload: PaymentCreate,
    db: AsyncSession = Depends(get_db),
):
    return await create_payment_repo(db, payload)


@router.put("/{payment_id}", response_model=Payment)
async def update_payment(
    payment_id: int,
    payload: PaymentUpdate,
    db: AsyncSession = Depends(get_db),
):
    try:
        return await update_payment_status_repo(db, payment_id, payload)
    except ValueError as e:
        code = str(e)
        if code == "PAYMENT_NOT_FOUND":
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy Payment"
            )
        if code == "INVALID_STATUS_TRANSITION":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT, detail=code
            )
        raise


@router.post("/webhook/{provider}", response_model=Payment)
async def handle_webhook(
    provider: str,
    payload: PaymentWebhookPayload,
    db: AsyncSession = Depends(get_db),
):
    try:
        return await handle_webhook_repo(db, provider, payload)
    except ValueError as e:
        code = str(e)
        if code == "PAYMENT_NOT_FOUND":
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy Payment"
            )
        if code == "INVALID_STATUS_TRANSITION":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT, detail=code
            )
        raise


@router.post("/{payment_id}/refund", response_model=Payment)
async def refund_payment(
    payment_id: int,
    payload: PaymentRefund,
    db: AsyncSession = Depends(get_db),
):
    try:
        return await refund_payment_repo(db, payment_id, payload)
    except ValueError as e:
        code = str(e)
        if code == "PAYMENT_NOT_FOUND":
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy Payment"
            )
        if code in {"ONLY_SUCCESS_CAN_REFUND", "INVALID_REFUND_AMOUNT"}:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT, detail=code
            )
        raise
