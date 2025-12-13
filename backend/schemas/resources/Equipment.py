from pydantic import BaseModel
from models import EquipmentStatus, EquipmentType

# --- Equipment Type Schemas ---
class EquipmentTypeCreate(BaseModel):
    name: str

class EquipmentTypeUpdate(BaseModel):
    name: str | None = None

class EquipmentTypeFilter(EquipmentTypeUpdate):
    pass

class EquipmentTypeRead(BaseModel):
    id: int
    name: str

    model_config = {
        "from_attributes": True
    }


# --- Equipment Status Schemas ---
class EquipmentStatusCreate(BaseModel):
    status: str

class EquipmentStatusUpdate(BaseModel):
    status: str | None = None

class EquipmentStatusFilter(EquipmentStatusUpdate):
    pass

class EquipmentStatusRead(BaseModel):
    id: int
    status: str

    model_config = {
        "from_attributes": True
    }

# --- Equipment Schemas ---
class EquipmentCreate(BaseModel):
    name: str
    type_id: int
    status_id: int

class EquipmentUpdate(BaseModel):
    name: str | None = None
    type_id: int | None = None
    status_id: int | None = None

class EquipmentFilter(EquipmentUpdate):
    pass

class EquipmentReadBase(BaseModel):
    id: int
    name: str
    type_id: int
    status_id: int

    model_config = {
        "from_attributes": True
    }

class EquipmentReadExtended(EquipmentReadBase):
    type: EquipmentTypeRead
    status: EquipmentStatusRead


