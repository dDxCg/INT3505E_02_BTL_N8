from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from configs.postgre import get_db

from repository.resources import EquipmentStatusRepository
from schemas.resources import EquipmentStatusCreate, EquipmentStatusUpdate, EquipmentStatusRead, EquipmentStatusFilter

router = APIRouter(prefix="/resources/equipment-statuses", tags=["Equipments"])

@router.post("", response_model=EquipmentStatusRead)
async def create_equipment_status(
    equipment_status: EquipmentStatusCreate,
    db: AsyncSession = Depends(get_db),
):
    equipment_status_repository = EquipmentStatusRepository(db)
    return await equipment_status_repository.create_equipment_status(equipment_status)

@router.get("", response_model=list[EquipmentStatusRead])
async def get_equipment_statuses(
    filter: EquipmentStatusFilter = Depends(),
    db: AsyncSession = Depends(get_db),
):
    equipment_status_repository = EquipmentStatusRepository(db)
    return await equipment_status_repository.get_all_equipment_statuses(filter)

@router.get("/{equipment_status_id}", response_model=EquipmentStatusRead)
async def get_equipment_status_by_id(
    equipment_status_id: int,
    db: AsyncSession = Depends(get_db),
):
    equipment_status_repository = EquipmentStatusRepository(db)
    return await equipment_status_repository.get_equipment_status_by_id(equipment_status_id)

@router.put("/{equipment_status_id}", response_model=EquipmentStatusRead)
async def update_equipment_status(
    equipment_status_id: int,
    equipment_status: EquipmentStatusUpdate,
    db: AsyncSession = Depends(get_db),
):
    equipment_status_repository = EquipmentStatusRepository(db)
    return await equipment_status_repository.update_equipment_status(equipment_status_id, equipment_status)

@router.delete("/{equipment_status_id}", response_model=EquipmentStatusRead)
async def delete_equipment_status(
    equipment_status_id: int,
    db: AsyncSession = Depends(get_db),
):
    equipment_status_repository = EquipmentStatusRepository(db)
    return await equipment_status_repository.delete_equipment_status(equipment_status_id)