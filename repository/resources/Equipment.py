from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import and_, delete, select, update
from models import Equipment
from schemas.resources import (
    EquipmentCreate,
    EquipmentFilter,
    EquipmentUpdate,
)

class EquipmentRepository:
    def __init__(self, db: AsyncSession):
        self.db = db


    async def create_equipment(self, data: EquipmentCreate) -> Equipment:
        equip = Equipment(**data.model_dump())  
        self.db.add(equip)
        await self.db.commit()
        await self.db.refresh(equip)  
        return equip


    async def get_all(self, filters: EquipmentFilter) -> list[Equipment]:
        query = select(Equipment)
        conditions = []

        if filters.name is not None:
            conditions.append(Equipment.name.ilike(f"%{filters.name}%"))
        if filters.type_id is not None:
            conditions.append(Equipment.type_id == filters.type_id)
        if filters.status_id is not None:
            conditions.append(Equipment.status_id == filters.status_id)

        if conditions:
            query = query.where(and_(*conditions))

        result = await self.db.execute(query)
        return result.scalars().all()


    async def get_by_id(self, equipment_id: int) -> Equipment | None:
        result = await self.db.execute(select(Equipment).where(Equipment.id == equipment_id))
        return result.scalar_one_or_none()


    async def delete_equipment(self, equipment_id: int) -> Equipment | None:
        equip = await self.get_by_id(equipment_id)
        if equip:
            await self.db.execute(delete(Equipment).where(Equipment.id == equipment_id))
            await self.db.commit()
        return equip    
    

    async def update_equipment(self, equipment_id: int, data: EquipmentUpdate) -> Equipment | None:
        update_data = {}
        for k, v in data.model_dump().items():
            if v is not None:
                update_data[k] = v

        if not update_data:
            return await self.get_by_id(equipment_id)

        await self.db.execute(update(Equipment).where(Equipment.id == equipment_id).values(**update_data))
        await self.db.commit()
        return await self.get_by_id(equipment_id)
    
class EquipmentTypeRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

class EquipmentStatusRepository:
    def __init__(self, db: AsyncSession):
        self.db = db