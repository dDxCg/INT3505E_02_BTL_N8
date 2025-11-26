from datetime import datetime

from sqlalchemy import select

from app.db import SessionLocal
from app.models.payments import PaymentDB
import uuid
from app.schemas.payments import (
    Payment,
    PaymentStatus,
    PaymentMethod,
    PaymentCreate,
    PaymentProvider,
    Currency,
)

def build_qr_url(payment_id: str) -> str:
    return f"https://dummy-qr/{payment_id}"


async def list_payments_repo(
    booking_id: int | None = None,
    status: PaymentStatus | None = None,
    from_date: datetime | None = None,
    to_date: datetime | None = None,
) -> list[Payment]:
    async with SessionLocal() as session:
        stmt = select(PaymentDB)

        if booking_id is not None:
            stmt = stmt.where(PaymentDB.booking_id == booking_id)
        if status is not None:
            stmt = stmt.where(PaymentDB.status == status.value)
        if from_date is not None:
            stmt = stmt.where(PaymentDB.created_at >= from_date)
        if to_date is not None:
            stmt = stmt.where(PaymentDB.created_at <= to_date)

        result = await session.execute(stmt)
        rows = result.scalars().all()

        payments: list[Payment] = []
        for row in rows:
            payments.append(
                Payment(
                    id=row.id,
                    booking_id=row.booking_id,
                    amount=row.amount,
                    currency=Currency(row.currency),
                    method=PaymentMethod(row.method),
                    status=PaymentStatus(row.status),
                    created_at=row.created_at,
                    provider=PaymentProvider(row.provider)
                    if row.provider is not None
                    else None,
                    provider_transaction_id=row.provider_transaction_id,
                    qr_url=build_qr_url(row.id),
                )
            )
        return payments


async def create_payment_repo(data: PaymentCreate) -> Payment:
    async with SessionLocal() as session:
        new_id = f"pay_{uuid.uuid4().hex}"
        now = datetime.utcnow()

        provider_txn_id: str | None = None
        if data.method == PaymentMethod.E_WALLET and data.provider is not None:
            provider_txn_id = f"txn_{uuid.uuid4().hex}"

        db_payment = PaymentDB(
            id=new_id,
            booking_id=data.booking_id,
            amount=data.amount,
            currency=data.currency.value,
            method=data.method.value,
            status=PaymentStatus.PENDING.value,
            created_at=now,
            provider=data.provider.value if data.provider is not None else None,
            provider_transaction_id=provider_txn_id,
        )

        session.add(db_payment)
        await session.commit()
        await session.refresh(db_payment)

    return Payment(
        id=db_payment.id,
        booking_id=db_payment.booking_id,
        amount=db_payment.amount,
        currency=Currency(db_payment.currency),
        method=PaymentMethod(db_payment.method),
        status=PaymentStatus(db_payment.status),
        created_at=db_payment.created_at,
        provider=PaymentProvider(db_payment.provider)
        if db_payment.provider is not None
        else None,
        provider_transaction_id=db_payment.provider_transaction_id,
        qr_url=build_qr_url(db_payment.id),
    )


async def get_payment_repo(payment_id: str) -> Payment | None:
    async with SessionLocal() as session:
        stmt = select(PaymentDB).where(PaymentDB.id == payment_id)
        result = await session.execute(stmt)
        row = result.scalar_one_or_none()

        if row is None:
            return None

        return Payment(
            id=row.id,
            booking_id=row.booking_id,
            amount=row.amount,
            currency=Currency(row.currency),
            method=PaymentMethod(row.method),
            status=PaymentStatus(row.status),
            created_at=row.created_at,
            provider=PaymentProvider(row.provider)
            if row.provider is not None
            else None,
            provider_transaction_id=row.provider_transaction_id,
            qr_url=build_qr_url(row.id),
        )

async def update_payment_status_repo(
        payment_id: str,
        new_status: PaymentStatus,
        provider_transaction_id: str | None = None,
) -> Payment | None:
    async with SessionLocal() as session:
        result = await session.execute(
            select(PaymentDB).where(PaymentDB.id == payment_id)
        )
        db_payment = result.scalar_one_or_none()

        if db_payment is None:
            return None
        
        current_status = PaymentStatus(db_payment.status)

        if new_status != current_status:
            allowed_transitions: dict[PaymentStatus, set[PaymentStatus]] = {
                PaymentStatus.PENDING: {
                    PaymentStatus.SUCCESS,
                    PaymentStatus.FAILED,
                    PaymentStatus.EXPIRED,
                },
                PaymentStatus.SUCCESS: {PaymentStatus.REFUNDED},
                PaymentStatus.FAILED: set(),
                PaymentStatus.EXPIRED: set(),
                PaymentStatus.REFUNDED: set(),
            }

            allowed = allowed_transitions[current_status]
            if new_status not in allowed:
                raise ValueError(
                    f"Không được phép chuyển từ {current_status.value} sang {new_status.value}"
                )
            
            db_payment.status = new_status.value

        if provider_transaction_id is not None:
            db_payment.provider_transaction_id = provider_transaction_id

        await session.commit()
        await session.refresh(db_payment)

        provider = (
            PaymentProvider(db_payment.provider) if db_payment.provider is not None else None
        )

        payment = Payment(
            id=db_payment.id,
            booking_id=db_payment.booking_id,
            amount=db_payment.amount,
            currency=Currency(db_payment.currency),
            method=PaymentMethod(db_payment.method),
            status=PaymentStatus(db_payment.status),
            created_at=db_payment.created_at,
            provider=provider,
            provider_transaction_id=db_payment.provider_transaction_id,
            qr_url=build_qr_url(db_payment.id),
        )
        return payment