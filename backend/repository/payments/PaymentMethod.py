from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError

from models.Payment import PaymentMethod as PaymentMethodModel
from schemas.payments.payments import (
    PaymentMethodCreate,
    PaymentMethodUpdate,
)


class PaymentMethodRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self) -> List[PaymentMethodModel]:
        result = await self.db.execute(select(PaymentMethodModel))
        return list(result.scalars().all())

    async def get_by_id(self, method_id: int) -> Optional[PaymentMethodModel]:
        result = await self.db.execute(
            select(PaymentMethodModel).where(PaymentMethodModel.id == method_id)
        )
        return result.scalar_one_or_none()

    async def create(self, data: PaymentMethodCreate) -> PaymentMethodModel:
        method = PaymentMethodModel(
            name=data.name,
        )
        self.db.add(method)
        try:
            await self.db.commit()
        except IntegrityError:
            await self.db.rollback()
            # name đã unique, nên lỗi này là do trùng name
            raise ValueError("METHOD_NAME_EXISTS")
        except Exception:
            await self.db.rollback()
            raise

        await self.db.refresh(method)
        return method

    async def update(
        self,
        method_id: int,
        data: PaymentMethodUpdate,
    ) -> Optional[PaymentMethodModel]:
        method = await self.get_by_id(method_id)
        if method is None:
            return None

        method.name = data.name

        try:
            await self.db.commit()
        except IntegrityError:
            await self.db.rollback()
            raise ValueError("METHOD_NAME_EXISTS")
        except Exception:
            await self.db.rollback()
            raise

        await self.db.refresh(method)
        return method

    async def delete(self, method_id: int) -> bool:
        method = await self.get_by_id(method_id)
        if method is None:
            return False

        await self.db.delete(method)
        try:
            await self.db.commit()
        except Exception:
            await self.db.rollback()
            raise

        return True
