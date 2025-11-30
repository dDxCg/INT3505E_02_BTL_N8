from repository.resources import EquipmentRepository, EquipmentTypeRepository, EquipmentStatusRepository

from models import Equipment, EquipmentType, EquipmentStatus
from sqlalchemy.ext.asyncio import AsyncSession

from schemas.resources import EquipmentFilter, EquipmentCreate, EquipmentUpdate


class EquipmentService:
    def __init__(self, db: AsyncSession):
        self.repo = EquipmentRepository(db)


class EquipmentTypeService:
    def __init__(self, db: AsyncSession):
        self.repo = EquipmentTypeRepository(db)

class EquipmentStatusService:
    def __init__(self, db: AsyncSession):
        self.repo = EquipmentStatusRepository(db)