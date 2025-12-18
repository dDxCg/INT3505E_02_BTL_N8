from pydantic import BaseModel, Field
from typing import Optional

#---Table Status---
class TableStatusRead(BaseModel):
    id: int
    status: str

    model_config = {
        "from_attributes": True
    }

class TableStatusCreate(BaseModel):
    status: str

class TableStatusUpdate(BaseModel):
    status: Optional[str] = None

class TableStatusFilter(BaseModel):
    status: Optional[str] = None

#---Table---
class TableCreate(BaseModel):
    """Create a table"""
    number: str 
    seats: int = Field(..., ge=1)
    status_id: int


class TableUpdate(BaseModel):
    """Update table info"""
    number: Optional[str] = None
    seats: Optional[int] = Field(None, ge=1)
    status_id: Optional[int] = None


class TableFilter(TableUpdate):
    """Filter tables"""
    pass


class TableReadBase(BaseModel):
    """Read table"""
    id: int
    number: str
    seats: int
    status_id: int

    model_config = {
        "from_attributes": True
    }

class TableReadExtended(TableReadBase):
    status: TableStatusRead

