from pydantic import BaseModel
from typing import Optional


class OrderCreate(BaseModel):
    """Create Order at a table"""
    table_id: int
    guest_id: Optional[int] = None
    status_id: Optional[int] = None  # Default = 1 (pending)


class OrderUpdate(BaseModel):
    """Update Order"""
    status_id: Optional[int] = None
    guest_id: Optional[int] = None


class OrderFilter(BaseModel):
    """Filter Orders by criteria"""
    table_id: Optional[int] = None
    status_id: Optional[int] = None
    guest_id: Optional[int] = None


class OrderRead(BaseModel):
    """Read Order"""
    id: int
    table_id: int
    status_id: int
    guest_id: Optional[int] = None

    model_config = {
        "from_attributes": True
    }
