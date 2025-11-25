from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from configs.postgre import get_db

from repository.resources import EquipmentTypeRepository
from schemas.resources import EquipmentTypeCreate, EquipmentTypeUpdate, EquipmentTypeRead, EquipmentTypeFilter

router = APIRouter(prefix="/resources/equipment-types", tags=["Equipment Types"])

@router.post("/", response_model=EquipmentTypeRead)
async def create_equipment_type(
    equipment_type: EquipmentTypeCreate,
    db: AsyncSession = Depends(get_db),
):
    equipment_type_repository = EquipmentTypeRepository(db)
    return await equipment_type_repository.create_equipment_type(equipment_type)


@router.get("/", response_model=list[EquipmentTypeRead])
async def get_equipment_types(
    filter: EquipmentTypeFilter = Depends(),
    db: AsyncSession = Depends(get_db),
):
    equipment_type_repository = EquipmentTypeRepository(db)
    return await equipment_type_repository.get_all_equipment_types(filter)


@router.get("/{equipment_type_id}", response_model=EquipmentTypeRead)
async def get_equipment_type_by_id(
    equipment_type_id: int,
    db: AsyncSession = Depends(get_db),
):
    equipment_type_repository = EquipmentTypeRepository(db)
    return await equipment_type_repository.get_equipment_type_by_id(equipment_type_id)


@router.put("/{equipment_type_id}", response_model=EquipmentTypeRead)
async def update_equipment_type(
    equipment_type_id: int,
    equipment_type: EquipmentTypeUpdate,
    db: AsyncSession = Depends(get_db),
):
    equipment_type_repository = EquipmentTypeRepository(db)
    return await equipment_type_repository.update_equipment_type(equipment_type_id, equipment_type)


@router.delete("/{equipment_type_id}", response_model=EquipmentTypeRead)
async def delete_equipment_type(
    equipment_type_id: int,
    db: AsyncSession = Depends(get_db),
):
    equipment_type_repository = EquipmentTypeRepository(db)
    return await equipment_type_repository.delete_equipment_type(equipment_type_id)