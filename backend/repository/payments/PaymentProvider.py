from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.Payment import PaymentProvider as PaymentProviderModel
from schemas.payments.payments import (
    PaymentProviderRead,
    PaymentProviderCreate,
    PaymentProviderUpdate,
)


class PaymentProviderRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self) -> list[PaymentProviderRead]:
        stmt = select(PaymentProviderModel)
        result = await self.db.execute(stmt)
        providers = result.scalars().all()
        return [PaymentProviderRead.model_validate(p) for p in providers]

    async def get_by_id(self, provider_id: int) -> PaymentProviderRead | None:
        stmt = select(PaymentProviderModel).where(
            PaymentProviderModel.id == provider_id
        )
        result = await self.db.execute(stmt)
        provider = result.scalar_one_or_none()
        if provider is None:
            return None
        return PaymentProviderRead.model_validate(provider)

    async def create(self, data: PaymentProviderCreate) -> PaymentProviderRead:
        provider = PaymentProviderModel(name=data.name)
        self.db.add(provider)

        try:
            await self.db.commit()
        except Exception:
            await self.db.rollback()
            raise

        await self.db.refresh(provider)
        return PaymentProviderRead.model_validate(provider)

    async def update(
        self,
        provider_id: int,
        data: PaymentProviderUpdate,
    ) -> PaymentProviderRead | None:
        stmt = select(PaymentProviderModel).where(
            PaymentProviderModel.id == provider_id
        )
        result = await self.db.execute(stmt)
        provider = result.scalar_one_or_none()
        if provider is None:
            return None

        provider.name = data.name

        try:
            await self.db.commit()
        except Exception:
            await self.db.rollback()
            raise

        await self.db.refresh(provider)
        return PaymentProviderRead.model_validate(provider)

    async def delete(self, provider_id: int) -> bool:
        stmt = select(PaymentProviderModel).where(
            PaymentProviderModel.id == provider_id
        )
        result = await self.db.execute(stmt)
        provider = result.scalar_one_or_none()
        if provider is None:
            return False

        await self.db.delete(provider)

        try:
            await self.db.commit()
        except Exception:
            await self.db.rollback()
            raise

        return True
