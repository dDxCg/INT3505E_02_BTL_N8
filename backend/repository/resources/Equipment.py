from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import and_, delete, select, update
from models import Equipment, EquipmentType, EquipmentStatus
from schemas.resources import (
    EquipmentCreate,
    EquipmentFilter,
    EquipmentUpdate,
    EquipmentTypeCreate,
    EquipmentTypeFilter,
    EquipmentTypeUpdate,
    EquipmentStatusCreate,
    EquipmentStatusFilter,
    EquipmentStatusUpdate,
)

class EquipmentRepository:
    def __init__(self, db: AsyncSession):
        self.db = db


    async def create_equipment(self, data: EquipmentCreate) -> Equipment:
        type_ = await self.db.execute(select(EquipmentType).where(EquipmentType.id == data.type_id))
        if (type_.scalar_one_or_none() is None):
            raise ValueError(f"EquipmentType with id {data.type_id} does not exist.")
        status = await self.db.execute(select(EquipmentStatus).where(EquipmentStatus.id == data.status_id))
        if (status.scalar_one_or_none() is None):
            raise ValueError(f"EquipmentStatus with id {data.status_id} does not exist.")
        equip = Equipment(**data.model_dump())  
        self.db.add(equip)
        await self.db.commit()
        await self.db.refresh(equip)  
        return equip


    async def get_all_equipment(self, filters: EquipmentFilter) -> list[Equipment]:
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


    async def get_equipment_by_id(self, equipment_id: int) -> Equipment | None:
        result = await self.db.execute(select(Equipment).where(Equipment.id == equipment_id))
        return result.scalar_one_or_none()


    async def delete_equipment(self, equipment_id: int) -> Equipment | None:
        equip = await self.get_equipment_by_id(equipment_id)
        if equip:
            await self.db.execute(delete(Equipment).where(Equipment.id == equipment_id))
            await self.db.commit()
        return equip    
    

    async def update_equipment(self, equipment_id: int, data: EquipmentUpdate) -> Equipment | None:
        equip = await self.get_equipment_by_id(equipment_id)
        if not equip:
            return None

        update_data = {}
        for k, v in data.model_dump().items():
            if v is not None:
                update_data[k] = v

        if not update_data:
            return equip
        
        if 'type_id' in update_data:
            type_ = await self.db.execute(select(EquipmentType).where(EquipmentType.id == update_data['type_id']))
            if (type_.scalar_one_or_none() is None):
                raise ValueError(f"EquipmentType with id {update_data['type_id']} does not exist.")
        
        if 'status_id' in update_data:
            status = await self.db.execute(select(EquipmentStatus).where(EquipmentStatus.id == update_data['status_id']))
            if (status.scalar_one_or_none() is None):
                raise ValueError(f"EquipmentStatus with id {update_data['status_id']} does not exist.")

        await self.db.execute(update(Equipment).where(Equipment.id == equipment_id).values(**update_data))
        await self.db.commit()
        await self.db.refresh(equip)
        return equip
    
class EquipmentTypeRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_equipment_type(self, data: EquipmentTypeCreate) -> EquipmentType:
        equip_type = EquipmentType(**data.model_dump())  
        self.db.add(equip_type)
        await self.db.commit()
        await self.db.refresh(equip_type)  
        return equip_type
    
    async def get_equipment_type_by_id(self, type_id: int) -> EquipmentType | None:
        result = await self.db.execute(select(EquipmentType).where(EquipmentType.id == type_id))
        return result.scalar_one_or_none()
    
    async def get_all_equipment_types(self, filters: EquipmentTypeFilter) -> list[EquipmentType]:
        query = select(EquipmentType)
        conditions = []

        if filters.name is not None:
            conditions.append(EquipmentType.name.ilike(f"%{filters.name}%"))

        if conditions:
            query = query.where(and_(*conditions))

        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def update_equipment_type(self, type_id: int, data: EquipmentTypeUpdate) -> EquipmentType | None:
        equip_type = await self.get_equipment_type_by_id(type_id)
        if not equip_type:
            return None

        update_data = {}
        for k, v in data.model_dump().items():
            if v is not None:
                update_data[k] = v

        if not update_data:
            return equip_type

        await self.db.execute(update(EquipmentType).where(EquipmentType.id == type_id).values(**update_data))
        await self.db.commit()
        await self.db.refresh(equip_type)
        return equip_type
    
    async def delete_equipment_type(self, type_id: int) -> EquipmentType | None:
        equip_type = await self.get_equipment_type_by_id(type_id)
        if equip_type:
            await self.db.execute(delete(EquipmentType).where(EquipmentType.id == type_id))
            await self.db.commit()
        return equip_type

class EquipmentStatusRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_equipment_status(self, data: EquipmentStatusCreate) -> EquipmentStatus:
        equip_status = EquipmentStatus(**data.model_dump())  
        self.db.add(equip_status)
        await self.db.commit()
        await self.db.refresh(equip_status)  
        return equip_status
    
    async def get_equipment_status_by_id(self, status_id: int) -> EquipmentStatus | None:
        result = await self.db.execute(select(EquipmentStatus).where(EquipmentStatus.id == status_id))
        return result.scalar_one_or_none()
    
    async def get_all_equipment_statuses(self, filters: EquipmentStatusFilter) -> list[EquipmentStatus]:
        query = select(EquipmentStatus)
        conditions = []

        if filters.status is not None:
            conditions.append(EquipmentStatus.status.ilike(f"%{filters.status}%"))

        if conditions:
            query = query.where(and_(*conditions))

        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def update_equipment_status(self, status_id: int, data: EquipmentStatusUpdate) -> EquipmentStatus | None:
        equip_status = await self.get_equipment_status_by_id(status_id)
        if not equip_status:
            return None
        
        update_data = {}
        for k, v in data.model_dump().items():
            if v is not None:
                update_data[k] = v

        if not update_data:
            return equip_status

        await self.db.execute(update(EquipmentStatus).where(EquipmentStatus.id == status_id).values(**update_data))
        await self.db.commit()
        await self.db.refresh(equip_status)
        return equip_status
    
    async def delete_equipment_status(self, status_id: int) -> EquipmentStatus | None:
        equip_status = await self.get_equipment_status_by_id(status_id)
        if equip_status:
            await self.db.execute(delete(EquipmentStatus).where(EquipmentStatus.id == status_id))
            await self.db.commit()
        return equip_status