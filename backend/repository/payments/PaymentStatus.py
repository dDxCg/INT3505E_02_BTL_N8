from typing import List, Optional 

from sqlalchemy import select 
from sqlalchemy.ext.asyncio import AsyncSession

from models.Payment import PaymentStatus as PaymentStatusModel
from schemas.payments.payments import (
    PaymentStatusCreate,
    PaymentStatusUpdate, 
    PaymentStatusRead,
)

class PaymentStatusRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self) -> List[PaymentStatusModel]:
        result = await self.db.execute(select(PaymentStatusModel))
        return list(result.scalars().all())
    
    async def get_by_id(self, status_id: int) -> Optional[PaymentStatusModel]:
        result = await self.db.execute(
            select(PaymentStatusModel).where(PaymentStatusModel.id == status_id)
        )
        return result.scalar_one_or_none()
    
    async def create(
            self,
            data: PaymentStatusCreate,
    ) -> PaymentStatusModel:
        status = PaymentStatusModel(**data.model_dump())
        self.db.add(status)
        try:
            await self.db.commit()
        except Exception:
            await self.db.rollback()
            raise 
        await self.db.refresh(status)
        return status 
    
    async def update(
            self,
            status: PaymentStatusModel,
            data: PaymentStatusUpdate,
    ) -> PaymentStatusModel:
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(status, field, value)

        self.db.add(status)
        try:
            await self.db.commit()
        except Exception:
            await self.db.rollback()
            raise 
        await self.db.refresh(status)
        return status
    
    async def delete(self, status: PaymentStatusModel) -> None: 
        await self.db.delete(status)
        try: 
            await self.db.commit()
        except Exception:
            await self.db.rollback()
            raise 