import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.Payment import Payment as PaymentModel
from schemas.payments import (
    Payment,
    PaymentCreate,
    PaymentUpdate,
    PaymentWebhookPayload,
    PaymentRefund,
)

# --- Status constants ---
PAYMENT_STATUS_PENDING = 1
PAYMENT_STATUS_SUCCESS = 2
PAYMENT_STATUS_FAILED = 3
PAYMENT_STATUS_EXPIRED = 4
PAYMENT_STATUS_REFUNDED = 5


# --- Helpers ---

def generate_pending_txn_id() -> str:
    return f"pending_{uuid.uuid4().hex}"


def build_qr_url(payment_id: int) -> str:
    return f"https://dummy-qr/pay_{payment_id}"


def map_db_to_schema(db_payment: PaymentModel) -> Payment:
    return Payment(
        id=db_payment.id,
        booking_id=db_payment.booking_id,
        amount=float(db_payment.amount),
        currency=db_payment.currency,
        method_id=db_payment.method_id,
        provider_id=db_payment.provider_id,
        status_id=db_payment.status_id,
        paid_at=db_payment.paid_at,
        expired_at=db_payment.expired_at,              
        gateway_txn_ref=db_payment.gateway_txn_ref,
        qr_url=build_qr_url(db_payment.id),
        provider_transaction_id=db_payment.provider_transaction_id,
    )


# --- Basic queries ---

async def list_payments_repo(
    db: AsyncSession,
    booking_id: Optional[int] = None,
    status_id: Optional[int] = None,
) -> list[Payment]:
    stmt = select(PaymentModel)

    if booking_id is not None:
        stmt = stmt.where(PaymentModel.booking_id == booking_id)

    if status_id is not None:
        stmt = stmt.where(PaymentModel.status_id == status_id)

    result = await db.execute(stmt)
    payments = result.scalars().all()
    return [map_db_to_schema(p) for p in payments]


async def get_payment_repo(db: AsyncSession, payment_id: int) -> Optional[Payment]:
    result = await db.execute(
        select(PaymentModel).where(PaymentModel.id == payment_id)
    )
    payment = result.scalar_one_or_none()
    if payment is None:
        return None
    return map_db_to_schema(payment)


# --- Create payment ---

async def create_payment_repo(db: AsyncSession, data: PaymentCreate) -> Payment:
    db_payment = PaymentModel(
        booking_id=data.booking_id,
        currency=data.currency,
        amount=data.amount,
        method_id=data.method_id,
        provider_id=data.provider_id,
        status_id=PAYMENT_STATUS_PENDING,
        provider_transaction_id=generate_pending_txn_id(),
    )

    db.add(db_payment)
    try:
        await db.commit()
    except Exception:
        await db.rollback()
        raise

    await db.refresh(db_payment)
    return map_db_to_schema(db_payment)


# --- Update status ---

_allowed_transitions = {
    PAYMENT_STATUS_PENDING: {
        PAYMENT_STATUS_SUCCESS,
        PAYMENT_STATUS_FAILED,
        PAYMENT_STATUS_EXPIRED,
    },
    PAYMENT_STATUS_SUCCESS: {PAYMENT_STATUS_REFUNDED},
}


async def update_payment_status_repo(
    db: AsyncSession,
    payment_id: int,
    data: PaymentUpdate,
) -> Payment:
    result = await db.execute(
        select(PaymentModel).where(PaymentModel.id == payment_id)
    )
    payment = result.scalar_one_or_none()
    if payment is None:
        raise ValueError("PAYMENT_NOT_FOUND")

    current = payment.status_id
    target = data.status_id

    if current not in _allowed_transitions or target not in _allowed_transitions[current]:
        raise ValueError("INVALID_STATUS_TRANSITION")

    payment.status_id = target

    if current == PAYMENT_STATUS_PENDING and target == PAYMENT_STATUS_SUCCESS:
        payment.paid_at = datetime.utcnow()

    if data.provider_transaction_id is not None:
        payment.provider_transaction_id = data.provider_transaction_id

    try:
        await db.commit()
    except Exception:
        await db.rollback()
        raise

    await db.refresh(payment)
    return map_db_to_schema(payment)


# --- Webhook ---

async def handle_webhook_repo(
    db: AsyncSession,
    provider: str,
    data: PaymentWebhookPayload,
) -> Payment:
    # tạm thời chưa phân biệt provider, chỉ dùng success/failed
    new_status = PAYMENT_STATUS_SUCCESS if data.success else PAYMENT_STATUS_FAILED

    update = PaymentUpdate(
        status_id=new_status,
        provider_transaction_id=data.provider_transaction_id,
    )
    return await update_payment_status_repo(db, data.payment_id, update)


# --- Refund ---

async def refund_payment_repo(
    db: AsyncSession,
    payment_id: int,
    data: PaymentRefund,
) -> Payment:
    result = await db.execute(
        select(PaymentModel).where(PaymentModel.id == payment_id)
    )
    payment = result.scalar_one_or_none()
    if payment is None:
        raise ValueError("PAYMENT_NOT_FOUND")

    if payment.status_id != PAYMENT_STATUS_SUCCESS:
        raise ValueError("ONLY_SUCCESS_CAN_REFUND")

    total_amount = float(payment.amount)
    refund_amount = data.amount if data.amount is not None else total_amount

    if refund_amount <= 0 or refund_amount > total_amount:
        raise ValueError("INVALID_REFUND_AMOUNT")

    payment.status_id = PAYMENT_STATUS_REFUNDED

    try:
        await db.commit()
    except Exception:
        await db.rollback()
        raise

    await db.refresh(payment)
    return map_db_to_schema(payment)
