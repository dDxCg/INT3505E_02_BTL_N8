from pydantic import BaseModel, Field
from decimal import Decimal


# --- OrderItem Schemas ---
class OrderItemCreate(BaseModel):
    order_id: int
    dish_id: int
    quantity: int = Field(..., gt=0)  # Quantity must be greater than 0
    status_id: int

class OrderItemUpdate(BaseModel):
    order_id: int | None = None
    dish_id: int | None = None
    quantity: int | None = Field(None, gt=0)  # Quantity must be greater than 0
    status_id: int | None = None

class OrderItemFilter(OrderItemUpdate):
    pass

class OrderItemRead(BaseModel):
    id: int
    order_id: int
    dish_id: int
    dish_name: str
    price: Decimal
    quantity: int
    status_id: int
    status: str

    model_config = {
        "from_attributes": True
    }

class OrderItemBase(BaseModel):
    id: int
    order_id: int
    dish_id: int
    quantity: int
    status_id: int

    model_config = {
        "from_attributes": True
    }