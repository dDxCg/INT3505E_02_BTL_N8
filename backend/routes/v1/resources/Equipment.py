from fastapi import APIRouter, Depends
from configs.postgre import get_db
from sqlalchemy.ext.asyncio import AsyncSession

from repository.resources import EquipmentRepository
from schemas.resources import EquipmentCreate, EquipmentUpdate, EquipmentFilter, EquipmentReadBase, EquipmentReadExtended

router = APIRouter(prefix="/resources/equipments", tags=["Equipments"])


@router.post("", response_model=EquipmentReadBase)
async def create_equipment(
    equipment: EquipmentCreate,
    db: AsyncSession = Depends(get_db),
):
    equip_repository = EquipmentRepository(db)
    return await equip_repository.create_equipment(equipment)


@router.get("", response_model=list[EquipmentReadExtended])
async def get_equipments(
    filter: EquipmentFilter = Depends(),
    db: AsyncSession = Depends(get_db),
):
    equip_repository = EquipmentRepository(db)
    return await equip_repository.get_all_equipment(filter)


@router.get("/{equipment_id}", response_model=EquipmentReadExtended)
async def get_equipment_by_id(
    equipment_id: int,
    db: AsyncSession = Depends(get_db),
):
    equip_repository = EquipmentRepository(db)
    return await equip_repository.get_equipment_by_id(equipment_id)


@router.put("/{equipment_id}", response_model=EquipmentReadBase)
async def update_equipment(
    equipment_id: int,
    equipment: EquipmentUpdate,
    db: AsyncSession = Depends(get_db),
):
    equip_repository = EquipmentRepository(db)
    return await equip_repository.update_equipment(equipment_id, equipment)


@router.delete("/{equipment_id}", response_model=EquipmentReadBase)
async def delete_equipment(
    equipment_id: int,
    db: AsyncSession = Depends(get_db),
):
    equip_repository = EquipmentRepository(db)
    return await equip_repository.delete_equipment(equipment_id)