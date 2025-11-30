from pydantic import BaseModel, Field
from typing import Optional


class TableCreate(BaseModel):
    """Create a table"""
    number: int = Field(..., gt=0)
    seats: int = Field(..., ge=1)


class TableUpdate(BaseModel):
    """Update table info"""
    number: Optional[int] = Field(None, gt=0)
    seats: Optional[int] = Field(None, ge=1)


class TableFilter(BaseModel):
    """Filter tables"""
    number: Optional[int] = None
    seats: Optional[int] = None


class TableRead(BaseModel):
    """Read table"""
    id: int
    number: int
    seats: int

    model_config = {
        "from_attributes": True
    }
