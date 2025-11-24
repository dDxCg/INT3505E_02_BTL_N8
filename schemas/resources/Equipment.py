from pydantic import BaseModel

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

class EquipmentRead(BaseModel):
    id: int
    name: str
    type_id: int
    status_id: int

    class Config:
        orm_mode = True


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

    class Config:
        orm_mode = True


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

    class Config:
        orm_mode = True