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
    status: Optional[str]

class TableStatusFilter(TableStatusUpdate):
    pass

#---Table---
class TableCreate(BaseModel):
    """Create a table"""
    number: int = Field(..., gt=0)
    seats: int = Field(..., ge=1)


class TableUpdate(BaseModel):
    """Update table info"""
    number: Optional[int] = Field(None, gt=0)
    seats: Optional[int] = Field(None, ge=1)
    status_id: Optional[int] = None


class TableFilter(TableUpdate):
    """Filter tables"""
    pass


class TableReadBase(BaseModel):
    """Read table"""
    id: int
    number: int
    seats: int
    status_id: int

    model_config = {
        "from_attributes": True
    }

class TableReadExtended(TableReadBase):
    status: TableStatusRead

